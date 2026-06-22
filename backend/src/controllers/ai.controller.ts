import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { pool } from "../db/pg";
import {
    analyzeIssueWithAI,
    detectDuplicateIssue,
    verifyResolutionWithAI,
    getWardInsightsWithAI,
} from "../utils/gemini";

const ensureUuid = (id: string, fieldName: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        throw new ApiError(400, `${fieldName} is invalid`);
    }
};

/**
 * Controller to analyze reported issue description and optional images using Gemini.
 */
export const analyzeIssueController = asyncHandler(async (req: Request, res: Response) => {
    const { description, imageUrls = [] } = req.body;

    if (!description || !description.trim()) {
        throw new ApiError(400, "Description is required");
    }

    try {
        const result = await analyzeIssueWithAI(description, imageUrls);
        return res
            .status(200)
            .json(new ApiResponse(200, result, "Issue analyzed successfully"));
    } catch (error: any) {
        console.error("AI Analysis error:", error);
        throw new ApiError(500, error.message || "Failed to analyze issue with AI");
    }
});

/**
 * Controller to check if a new issue is a duplicate of nearby existing issues.
 */
export const checkDuplicateController = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, category, latitude, longitude } = req.body;

    if (!title || !description || !category || latitude === undefined || longitude === undefined) {
        throw new ApiError(400, "title, description, category, latitude, and longitude are required");
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new ApiError(400, "latitude and longitude must be valid numbers");
    }

    // Find all open issues within a 500 meters radius using SQL Haversine formula
    const query = `
        SELECT id AS "_id", title, description, category,
               (6371000 * acos(
                    least(1.0, greatest(-1.0, 
                        cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + 
                        sin(radians($1)) * sin(radians(latitude))
                    ))
               )) AS distance
        FROM issues
        WHERE status = 'open'
        GROUP BY id
        HAVING (6371000 * acos(
                    least(1.0, greatest(-1.0, 
                        cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + 
                        sin(radians($1)) * sin(radians(latitude))
                    ))
               )) <= 500
        LIMIT 10
    `;

    const nearbyRawIssues = await pool.query(query, [lat, lng]);

    const nearbyIssues = nearbyRawIssues.rows.map(i => ({
        id: i._id,
        title: i.title,
        description: i.description,
        category: i.category,
    }));

    if (nearbyIssues.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, { isDuplicate: false, reasoning: "No nearby open issues found." }, "No duplicates found")
        );
    }

    try {
        const result = await detectDuplicateIssue(
            { title, description, category },
            nearbyIssues
        );
        return res
            .status(200)
            .json(new ApiResponse(200, result, "Duplicate check completed"));
    } catch (error: any) {
        console.error("AI Duplicate detection error:", error);
        throw new ApiError(500, error.message || "Failed to run duplicate detection");
    }
});

/**
 * Controller to resolve an issue with AI-driven resolution proof verification.
 */
export const verifyResolutionController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const { issueId, resolutionImages = [] } = req.body;

    if (!issueId) {
        throw new ApiError(400, "issueId is required");
    }

    ensureUuid(issueId, "issueId");

    if (resolutionImages.length === 0) {
        throw new ApiError(400, "At least one resolution proof image URL is required");
    }

    // Fetch issue details
    const issueResult = await pool.query(
        "SELECT id, description, images, status, upvotes FROM issues WHERE id = $1",
        [issueId]
    );

    const issue = issueResult.rows[0];
    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }

    if (issue.status === "resolved") {
        throw new ApiError(400, "Issue has already been resolved");
    }

    try {
        // Call Gemini to verify resolution proof images against original issue
        const result = await verifyResolutionWithAI(
            issue.description,
            issue.images || [], // original images
            resolutionImages
        );

        if (!result.isResolved) {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    {
                        verified: false,
                        reasoning: result.reasoning,
                        qualityScore: result.qualityScore,
                    },
                    "AI verification failed. The uploaded resolution proof does not verify resolution."
                )
            );
        }

        // Calculate points based on AI quality score and upvotes
        const basePoints = 20;
        const qualityPoints = result.qualityScore * 5;
        const upvoteBonus = (issue.upvotes || 0) * 2;
        const totalPointsEarned = basePoints + qualityPoints + upvoteBonus;

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Issue is verified resolved. Update fields in Postgres
            const resolvedAt = new Date();
            const updateIssueResult = await client.query(
                `UPDATE issues
                 SET status = 'resolved', resolved_by = $1, resolved_at = $2, resolution_images = $3, resolution_feedback = $4, resolution_score = $5
                 WHERE id = $6
                 RETURNING id AS "_id", status, resolved_by AS "resolvedBy", resolved_at AS "resolvedAt"`,
                [req.user.id, resolvedAt, resolutionImages, result.reasoning, result.qualityScore, issueId]
            );

            // Reward the authority user who resolved it
            await client.query(
                "UPDATE users SET points = points + $1, issues_resolved = issues_resolved + 1 WHERE id = $2",
                [totalPointsEarned, req.user.id]
            );

            await client.query("COMMIT");

            return res.status(200).json(
                new ApiResponse(
                    200,
                    {
                        verified: true,
                        issue: updateIssueResult.rows[0],
                        pointsEarned: totalPointsEarned,
                        qualityScore: result.qualityScore,
                        feedback: result.reasoning,
                    },
                    "Issue resolved and verified by AI successfully!"
                )
            );
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error("AI Resolution verification error:", error);
        throw new ApiError(500, error.message || "Failed to verify resolution with AI");
    }
});

/**
 * Controller to fetch AI-generated ward insights for authority users.
 */
export const getWardInsightsController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    // Determine wardId: either query param or logged-in user's wardId
    let wardId = req.query.wardId as string;
    if (!wardId && req.user.wardId) {
        wardId = req.user.wardId.toString();
    }

    if (!wardId) {
        throw new ApiError(400, "wardId is required (no ward associated with this user)");
    }

    ensureUuid(wardId, "wardId");

    // Fetch Ward details
    const wardResult = await pool.query(
        'SELECT id, name, ward_number AS "wardNumber", city, state FROM wards WHERE id = $1',
        [wardId]
    );

    const ward = wardResult.rows[0];
    if (!ward) {
        throw new ApiError(404, "Ward not found");
    }

    // Fetch all issues in the ward
    const issuesResult = await pool.query(
        'SELECT category, status, upvotes, description, created_at AS "createdAt" FROM issues WHERE ward_id = $1',
        [wardId]
    );

    if (issuesResult.rows.length === 0) {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    summary: "No issues reported in this ward yet. The ward is currently clean and fully operational!",
                    criticalAreas: [],
                    trendAnalysis: "Not enough data to calculate trends.",
                    resourceAllocationRecommendations: ["No action items needed at this time."]
                },
                "Insights generated successfully"
            )
        );
    }

    const issues = issuesResult.rows.map(i => ({
        category: i.category,
        status: i.status,
        upvotes: i.upvotes,
        description: i.description,
        createdAt: i.createdAt,
    }));

    try {
        const insights = await getWardInsightsWithAI(
            {
                name: ward.name,
                number: ward.wardNumber,
                city: ward.city,
            },
            issues
        );

        return res
            .status(200)
            .json(new ApiResponse(200, insights, "Ward insights generated successfully"));
    } catch (error: any) {
        console.error("AI Ward Insights error:", error);
        throw new ApiError(500, error.message || "Failed to generate ward insights with AI");
    }
});

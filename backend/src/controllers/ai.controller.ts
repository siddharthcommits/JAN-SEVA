import mongoose from "mongoose";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Issue } from "../models/issue.model";
import { User } from "../models/user.model";
import { Ward } from "../models/ward.model";
import {
    analyzeIssueWithAI,
    detectDuplicateIssue,
    verifyResolutionWithAI,
    getWardInsightsWithAI,
} from "../utils/gemini";

const ensureObjectId = (id: string, fieldName: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
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

    // Find all open issues within a 500 meters radius
    const nearbyRawIssues = await Issue.find({
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
                $maxDistance: 500, // 500 meters
            },
        },
        status: "open",
    }).limit(10); // Limit to top 10 nearby open issues

    const nearbyIssues = nearbyRawIssues.map(i => ({
        id: (i._id as mongoose.Types.ObjectId).toString(),
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

    ensureObjectId(issueId, "issueId");

    if (resolutionImages.length === 0) {
        throw new ApiError(400, "At least one resolution proof image URL is required");
    }

    const issue = await Issue.findById(issueId);
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
            issue.images, // original images
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

        // Issue is verified resolved. Update fields
        issue.status = "resolved";
        issue.resolvedBy = new mongoose.Types.ObjectId(req.user.id);
        issue.resolvedAt = new Date();
        issue.resolutionImages = resolutionImages;
        issue.resolutionFeedback = result.reasoning;
        issue.resolutionScore = result.qualityScore;
        await issue.save();

        // Calculate points based on AI quality score and upvotes
        // Formula: Base 20 points + (qualityScore * 5) + (upvotes * 2)
        const basePoints = 20;
        const qualityPoints = result.qualityScore * 5;
        const upvoteBonus = issue.upvotes * 2;
        const totalPointsEarned = basePoints + qualityPoints + upvoteBonus;

        // Reward the authority user who resolved it
        await User.findByIdAndUpdate(req.user.id, {
            $inc: {
                points: totalPointsEarned,
                issuesResolved: 1,
            },
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    verified: true,
                    issue,
                    pointsEarned: totalPointsEarned,
                    qualityScore: result.qualityScore,
                    feedback: result.reasoning,
                },
                "Issue resolved and verified by AI successfully!"
            )
        );
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

    ensureObjectId(wardId, "wardId");

    const ward = await Ward.findById(wardId);
    if (!ward) {
        throw new ApiError(404, "Ward not found");
    }

    // Fetch all issues in the ward
    const rawIssues = await Issue.find({ wardId });

    if (rawIssues.length === 0) {
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

    const issues = rawIssues.map(i => ({
        category: i.category,
        status: i.status,
        upvotes: i.upvotes,
        description: i.description,
        createdAt: (i as any).createdAt,
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

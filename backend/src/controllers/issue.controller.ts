import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { pool } from "../db/pg";

const ensureUuid = (id: string, fieldName: string) => {
    // Simple UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        throw new ApiError(400, `${fieldName} is invalid`);
    }
};

export const createIssue = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const {
        title,
        description,
        category,
        images = [],
        latitude,
        longitude,
        wardId,
        departmentId,
    } = req.body;

    if (!title || !description || !category || latitude === undefined || longitude === undefined || !wardId || !departmentId) {
        throw new ApiError(400, "title, description, category, latitude, longitude, wardId and departmentId are required");
    }

    const validCategories = ["road", "garbage", "sewage", "water", "electricity"];
    if (!validCategories.includes(category)) {
        throw new ApiError(400, "Invalid category");
    }

    ensureUuid(wardId, "wardId");
    ensureUuid(departmentId, "departmentId");

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new ApiError(400, "latitude and longitude must be valid numbers");
    }

    const result = await pool.query(
        `INSERT INTO issues (title, description, category, images, latitude, longitude, ward_id, department_id, reported_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id AS "_id", title, description, category, images, latitude, longitude, ward_id AS "wardId", department_id AS "departmentId", reported_by AS "reportedBy", status, upvotes, downvotes, created_at`,
        [title, description, category, images, lat, lng, wardId, departmentId, req.user.id]
    );

    const issue = result.rows[0];

    return res
        .status(201)
        .json(new ApiResponse(201, issue, "Issue reported successfully"));
});

export const getIssues = asyncHandler(async (req: Request, res: Response) => {
    const { category, wardId, departmentId, status, sort, limit } = req.query;

    const queryParams: any[] = [];
    const filterClauses: string[] = [];

    if (category) {
        queryParams.push(category);
        filterClauses.push(`i.category = $${queryParams.length}`);
    }
    if (wardId) {
        ensureUuid(wardId as string, "wardId");
        queryParams.push(wardId);
        filterClauses.push(`i.ward_id = $${queryParams.length}`);
    }
    if (departmentId) {
        ensureUuid(departmentId as string, "departmentId");
        queryParams.push(departmentId);
        filterClauses.push(`i.department_id = $${queryParams.length}`);
    }
    if (status) {
        queryParams.push(status);
        filterClauses.push(`i.status = $${queryParams.length}`);
    }

    const whereClause = filterClauses.length > 0 ? "WHERE " + filterClauses.join(" AND ") : "";

    let orderClause = "ORDER BY i.created_at DESC";
    if (sort === "upvotes") {
        orderClause = "ORDER BY i.upvotes DESC, i.created_at DESC";
    }

    let limitClause = "";
    if (limit) {
        const limitNum = parseInt(limit as string, 10);
        if (!Number.isNaN(limitNum) && limitNum > 0) {
            queryParams.push(limitNum);
            limitClause = `LIMIT $${queryParams.length}`;
        }
    }

    const query = `
        SELECT i.id AS "_id", i.title, i.description, i.category, i.images, i.latitude, i.longitude, i.status, i.upvotes, i.downvotes, i.created_at,
               u.id AS user_id, u.name AS user_name, u.email AS user_email, u.role AS user_role, u.avatar AS user_avatar,
               w.id AS ward_uuid, w.name AS ward_name, w.ward_number, w.city, w.state,
               d.id AS dept_uuid, d.name AS dept_name,
               (SELECT COUNT(*)::int FROM comments c WHERE c.issue_id = i.id) AS comment_count
        FROM issues i
        LEFT JOIN users u ON i.reported_by = u.id
        LEFT JOIN wards w ON i.ward_id = w.id
        LEFT JOIN departments d ON i.department_id = d.id
        ${whereClause}
        ${orderClause}
        ${limitClause}
    `;

    const result = await pool.query(query, queryParams);

    const formattedIssues = result.rows.map(row => ({
        _id: row._id,
        title: row.title,
        description: row.description,
        category: row.category,
        images: row.images || [],
        location: {
            type: "Point",
            coordinates: [row.longitude, row.latitude]
        },
        status: row.status,
        upvotes: row.upvotes,
        downvotes: row.downvotes,
        createdAt: row.created_at,
        commentCount: row.comment_count || 0,
        reportedBy: {
            _id: row.user_id,
            name: row.user_name,
            email: row.user_email,
            role: row.user_role,
            avatar: row.user_avatar
        },
        wardId: row.ward_uuid ? {
            _id: row.ward_uuid,
            name: row.ward_name,
            wardNumber: row.ward_number,
            city: row.city,
            state: row.state
        } : null,
        departmentId: row.dept_uuid ? {
            _id: row.dept_uuid,
            name: row.dept_name
        } : null
    }));

    return res.status(200).json(new ApiResponse(200, formattedIssues, "Issues fetched successfully"));
});

export const getIssueById = asyncHandler(async (req: Request, res: Response) => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    ensureUuid(id, "Issue id");

    const query = `
        SELECT i.id AS "_id", i.title, i.description, i.category, i.images, i.latitude, i.longitude, i.status, i.upvotes, i.downvotes, i.created_at,
               i.resolution_images, i.resolution_feedback, i.resolution_score, i.resolved_at,
               u.id AS user_id, u.name AS user_name, u.email AS user_email, u.role AS user_role, u.avatar AS user_avatar,
               w.id AS ward_uuid, w.name AS ward_name, w.ward_number, w.city, w.state,
               d.id AS dept_uuid, d.name AS dept_name, d.description as dept_desc,
               ru.id AS resolved_user_id, ru.name AS resolved_user_name, ru.email AS resolved_user_role,
               (SELECT COUNT(*)::int FROM comments c WHERE c.issue_id = i.id) AS comment_count
        FROM issues i
        LEFT JOIN users u ON i.reported_by = u.id
        LEFT JOIN wards w ON i.ward_id = w.id
        LEFT JOIN departments d ON i.department_id = d.id
        LEFT JOIN users ru ON i.resolved_by = ru.id
        WHERE i.id = $1
    `;

    const result = await pool.query(query, [id]);
    const row = result.rows[0];

    if (!row) {
        throw new ApiError(404, "Issue not found");
    }

    const formattedIssue = {
        _id: row._id,
        title: row.title,
        description: row.description,
        category: row.category,
        images: row.images || [],
        location: {
            type: "Point",
            coordinates: [row.longitude, row.latitude]
        },
        status: row.status,
        upvotes: row.upvotes,
        downvotes: row.downvotes,
        createdAt: row.created_at,
        commentCount: row.comment_count || 0,
        resolutionImages: row.resolution_images || [],
        resolutionFeedback: row.resolution_feedback,
        resolutionScore: row.resolution_score,
        resolvedAt: row.resolved_at,
        reportedBy: {
            _id: row.user_id,
            name: row.user_name,
            email: row.user_email,
            role: row.user_role,
            avatar: row.user_avatar
        },
        wardId: row.ward_uuid ? {
            _id: row.ward_uuid,
            name: row.ward_name,
            wardNumber: row.ward_number,
            city: row.city,
            state: row.state
        } : null,
        departmentId: row.dept_uuid ? {
            _id: row.dept_uuid,
            name: row.dept_name,
            description: row.dept_desc
        } : null,
        resolvedBy: row.resolved_user_id ? {
            _id: row.resolved_user_id,
            name: row.resolved_user_name,
            email: row.resolved_user_role
        } : null
    };

    return res.status(200).json(new ApiResponse(200, formattedIssue, "Issue fetched successfully"));
});

export const getNearbyIssues = asyncHandler(async (req: Request, res: Response) => {
    const { latitude, longitude, radius } = req.query;

    const lat = Number(latitude);
    const lng = Number(longitude);
    const radiusInMeters = Number(radius);

    if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radiusInMeters) || radiusInMeters <= 0) {
        throw new ApiError(400, "latitude, longitude and radius must be valid positive numbers");
    }

    // Haversine formula to compute distance in meters
    const query = `
        SELECT i.id AS "_id", i.title, i.description, i.category, i.images, i.latitude, i.longitude, i.status, i.upvotes, i.downvotes, i.created_at,
               u.id AS user_id, u.name AS user_name, u.email AS user_email, u.role AS user_role, u.avatar AS user_avatar,
               w.id AS ward_uuid, w.name AS ward_name, w.ward_number, w.city, w.state,
               d.id AS dept_uuid, d.name AS dept_name,
               (SELECT COUNT(*)::int FROM comments c WHERE c.issue_id = i.id) AS comment_count,
               (6371000 * acos(
                    least(1.0, greatest(-1.0, 
                        cos(radians($1)) * cos(radians(i.latitude)) * cos(radians(i.longitude) - radians($2)) + 
                        sin(radians($1)) * sin(radians(i.latitude))
                    ))
               )) AS distance
        FROM issues i
        LEFT JOIN users u ON i.reported_by = u.id
        LEFT JOIN wards w ON i.ward_id = w.id
        LEFT JOIN departments d ON i.department_id = d.id
        GROUP BY i.id, u.id, w.id, d.id
        HAVING (6371000 * acos(
                    least(1.0, greatest(-1.0, 
                        cos(radians($1)) * cos(radians(i.latitude)) * cos(radians(i.longitude) - radians($2)) + 
                        sin(radians($1)) * sin(radians(i.latitude))
                    ))
               )) <= $3
        ORDER BY i.created_at DESC
    `;

    const result = await pool.query(query, [lat, lng, radiusInMeters]);

    const formattedIssues = result.rows.map(row => ({
        _id: row._id,
        title: row.title,
        description: row.description,
        category: row.category,
        images: row.images || [],
        location: {
            type: "Point",
            coordinates: [row.longitude, row.latitude]
        },
        status: row.status,
        upvotes: row.upvotes,
        downvotes: row.downvotes,
        createdAt: row.created_at,
        commentCount: row.comment_count || 0,
        reportedBy: {
            _id: row.user_id,
            name: row.user_name,
            email: row.user_email,
            role: row.user_role,
            avatar: row.user_avatar
        },
        wardId: row.ward_uuid ? {
            _id: row.ward_uuid,
            name: row.ward_name,
            wardNumber: row.ward_number,
            city: row.city,
            state: row.state
        } : null,
        departmentId: row.dept_uuid ? {
            _id: row.dept_uuid,
            name: row.dept_name
        } : null
    }));

    return res.status(200).json(new ApiResponse(200, formattedIssues, "Nearby issues fetched successfully"));
});

export const voteOnIssue = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const { vote } = req.body;

    ensureUuid(id, "Issue id");

    if (vote !== "upvote" && vote !== "downvote") {
        throw new ApiError(400, "vote must be either upvote or downvote");
    }

    const issueCheck = await pool.query("SELECT id, upvotes, downvotes FROM issues WHERE id = $1", [id]);
    const issue = issueCheck.rows[0];
    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }

    // Check if vote already exists
    const voteCheck = await pool.query(
        "SELECT id, vote_type FROM votes WHERE issue_id = $1 AND user_id = $2",
        [id, req.user.id]
    );

    const existingVote = voteCheck.rows[0];

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        if (!existingVote) {
            // Create new vote
            await client.query(
                "INSERT INTO votes (issue_id, user_id, vote_type) VALUES ($1, $2, $3)",
                [id, req.user.id, vote]
            );

            // Increment count
            if (vote === "upvote") {
                await client.query("UPDATE issues SET upvotes = upvotes + 1 WHERE id = $1", [id]);
            } else {
                await client.query("UPDATE issues SET downvotes = downvotes + 1 WHERE id = $1", [id]);
            }
        } else if (existingVote.vote_type === vote) {
            // Vote remains unchanged
            await client.query("COMMIT");
            return res.status(200).json(new ApiResponse(200, issue, "Vote unchanged"));
        } else {
            // Update vote type
            await client.query(
                "UPDATE votes SET vote_type = $1 WHERE id = $2",
                [vote, existingVote.id]
            );

            // Swap count
            if (vote === "upvote") {
                await client.query(
                    "UPDATE issues SET upvotes = upvotes + 1, downvotes = GREATEST(0, downvotes - 1) WHERE id = $1",
                    [id]
                );
            } else {
                await client.query(
                    "UPDATE issues SET downvotes = downvotes + 1, upvotes = GREATEST(0, upvotes - 1) WHERE id = $1",
                    [id]
                );
            }
        }

        await client.query("COMMIT");

        // Fetch updated counts
        const updatedCheck = await pool.query("SELECT id AS \"_id\", upvotes, downvotes, status FROM issues WHERE id = $1", [id]);
        return res.status(200).json(new ApiResponse(200, updatedCheck.rows[0], "Vote updated successfully"));
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
});

export const resolveIssue = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    ensureUuid(id, "Issue id");

    const issueCheck = await pool.query("SELECT id, status, upvotes FROM issues WHERE id = $1", [id]);
    const issue = issueCheck.rows[0];
    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }

    if (issue.status === "resolved") {
        throw new ApiError(400, "Issue already resolved");
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Mark resolved
        const resolvedAt = new Date();
        const updateIssueResult = await client.query(
            "UPDATE issues SET status = 'resolved', resolved_by = $1, resolved_at = $2 WHERE id = $3 RETURNING id AS \"_id\", status, resolved_by AS \"resolvedBy\", resolved_at AS \"resolvedAt\"",
            [req.user.id, resolvedAt, id]
        );

        const pointsEarned = issue.upvotes * 2;

        // Reward authority
        await client.query(
            "UPDATE users SET points = points + $1, issues_resolved = issues_resolved + 1 WHERE id = $2",
            [pointsEarned, req.user.id]
        );

        await client.query("COMMIT");

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    issue: updateIssueResult.rows[0],
                    pointsEarned,
                },
                "Issue resolved successfully"
            )
        );
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    ensureUuid(id, "Issue id");

    const { text } = req.body;
    if (!text || !text.trim()) {
        throw new ApiError(400, "Comment text is required");
    }

    const issueCheck = await pool.query("SELECT id FROM issues WHERE id = $1", [id]);
    if (issueCheck.rows.length === 0) {
        throw new ApiError(404, "Issue not found");
    }

    // Insert comment
    const commentResult = await pool.query(
        "INSERT INTO comments (issue_id, user_id, text) VALUES ($1, $2, $3) RETURNING id AS \"_id\", text, created_at AS \"createdAt\"",
        [id, req.user.id, text.trim()]
    );

    // Fetch user details
    const userResult = await pool.query("SELECT id AS \"_id\", name, email, avatar FROM users WHERE id = $1", [req.user.id]);

    const formattedComment = {
        ...commentResult.rows[0],
        userId: userResult.rows[0]
    };

    return res
        .status(201)
        .json(new ApiResponse(201, formattedComment, "Comment added successfully"));
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    ensureUuid(id, "Issue id");

    const query = `
        SELECT c.id AS "_id", c.text, c.created_at AS "createdAt",
               u.id AS user_id, u.name AS user_name, u.email AS user_email, u.avatar AS user_avatar
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.issue_id = $1
        ORDER BY c.created_at DESC
    `;

    const result = await pool.query(query, [id]);

    const formattedComments = result.rows.map(row => ({
        _id: row._id,
        text: row.text,
        createdAt: row.createdAt,
        userId: {
            _id: row.user_id,
            name: row.user_name,
            email: row.user_email,
            avatar: row.user_avatar
        }
    }));

    return res
        .status(200)
        .json(new ApiResponse(200, formattedComments, "Comments fetched successfully"));
});

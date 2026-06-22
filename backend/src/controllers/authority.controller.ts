import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { pool } from "../db/pg";

export const getAuthorityIssues = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    if (!req.user.departmentId) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No department assigned for this authority"));
    }

    // Fetch all issues in authority's department
    const query = `
        SELECT i.id AS "_id", i.title, i.description, i.category, i.images, i.latitude, i.longitude, i.status, i.upvotes, i.downvotes, i.created_at,
               u.id AS user_id, u.name AS user_name, u.email AS user_email, u.role AS user_role,
               w.id AS ward_uuid, w.name AS ward_name, w.ward_number, w.city, w.state,
               d.id AS dept_uuid, d.name AS dept_name
        FROM issues i
        LEFT JOIN users u ON i.reported_by = u.id
        LEFT JOIN wards w ON i.ward_id = w.id
        LEFT JOIN departments d ON i.department_id = d.id
        WHERE i.department_id = $1
        ORDER BY i.created_at DESC
    `;

    const result = await pool.query(query, [req.user.departmentId]);

    const mappedIssues = result.rows.map(row => ({
        _id: row._id,
        title: row.title,
        description: row.description,
        category: row.category,
        images: row.images || [],
        location: {
            type: "Point",
            coordinates: [row.longitude, row.latitude] // GeoJSON: [lng, lat]
        },
        status: row.status,
        upvotes: row.upvotes,
        downvotes: row.downvotes,
        createdAt: row.created_at,
        reportedBy: {
            _id: row.user_id,
            name: row.user_name,
            email: row.user_email,
            role: row.user_role
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

    return res
        .status(200)
        .json(new ApiResponse(200, mappedIssues, "Authority issues fetched successfully"));
});

export const getAuthorityLeaderboard = asyncHandler(async (_req: Request, res: Response) => {
    const query = `
        SELECT u.id AS "_id", u.name, u.email, u.phone, u.points, u.issues_resolved AS "issuesResolved",
               w.id as ward_uuid, w.name as ward_name, w.ward_number, w.city, w.state,
               d.id as dept_uuid, d.name as dept_name
        FROM users u
        LEFT JOIN wards w ON u.ward_id = w.id
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.role = 'authority'
        ORDER BY u.points DESC, u.issues_resolved DESC, u.created_at ASC
    `;

    const result = await pool.query(query);

    const mappedLeaderboard = result.rows.map(row => ({
        _id: row._id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        points: row.points,
        issuesResolved: row.issuesResolved,
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

    return res
        .status(200)
        .json(new ApiResponse(200, mappedLeaderboard, "Authority leaderboard fetched successfully"));
});

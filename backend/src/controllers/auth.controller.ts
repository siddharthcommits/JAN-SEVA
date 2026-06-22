import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../db/pg";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { signAuthToken } from "../middlewares/auth.middleware";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
        throw new ApiError(400, "name, email, phone, and password are required");
    }

    if (role && role !== "citizen") {
        throw new ApiError(403, "Self registration is allowed only for citizen role");
    }

    // Check if user already exists
    const checkUser = await pool.query(
        "SELECT id FROM users WHERE email = $1 OR phone = $2",
        [email.toLowerCase(), phone]
    );

    if (checkUser.rows.length > 0) {
        throw new ApiError(409, "User already exists with this email or phone");
    }

    // Hash password (previously done in mongoose pre-save hook)
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(
        `INSERT INTO users (name, email, phone, password, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, phone, role, points, issues_resolved`,
        [name, email.toLowerCase(), phone, hashedPassword, "citizen"]
    );

    const user = insertResult.rows[0];

    const token = signAuthToken({
        userId: user.id,
        role: user.role,
    });

    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        points: user.points,
        issuesResolved: user.issues_resolved,
    };

    return res
        .status(201)
        .json(new ApiResponse(201, { token, user: userData }, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "email and password are required");
    }

    // Get user with password
    const result = await pool.query(
        "SELECT id, name, email, phone, password, role, points, issues_resolved, ward_id, department_id FROM users WHERE email = $1",
        [email.toLowerCase()]
    );

    const user = result.rows[0];
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = signAuthToken({
        userId: user.id,
        role: user.role,
    });

    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        points: user.points,
        issuesResolved: user.issues_resolved,
        wardId: user.ward_id,
        departmentId: user.department_id,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, { token, user: userData }, "User logged in successfully"));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    // Fetch user details joined with ward and department
    const query = `
        SELECT u.id, u.name, u.email, u.phone, u.role, u.avatar, u.points, u.issues_resolved,
               w.id as ward_uuid, w.name as ward_name, w.ward_number, w.city, w.state,
               d.id as dept_uuid, d.name as dept_name, d.description as dept_desc
        FROM users u
        LEFT JOIN wards w ON u.ward_id = w.id
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.id = $1
    `;

    const result = await pool.query(query, [req.user.id]);
    const row = result.rows[0];

    if (!row) {
        throw new ApiError(404, "User not found");
    }

    // Format response to match mongoose object structure
    const formattedUser = {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        avatar: row.avatar,
        points: row.points,
        issuesResolved: row.issues_resolved,
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
        } : null
    };

    return res
        .status(200)
        .json(new ApiResponse(200, formattedUser, "User profile fetched"));
});

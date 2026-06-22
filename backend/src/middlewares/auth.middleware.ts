import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { pool } from "../db/pg";

interface AuthTokenPayload extends JwtPayload {
    userId: string;
}

const getJwtSecret = () => process.env.JWT_SECRET || "jan-seva-dev-secret";

export const signAuthToken = (payload: { userId: string; role: UserRole }) => {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
};

export const verifyJWT = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const authHeader = req.header("Authorization");
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.slice(7)
            : undefined;

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decoded = jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
        if (!decoded?.userId) {
            throw new ApiError(401, "Invalid auth token");
        }

        const result = await pool.query(
            "SELECT id, role, ward_id, department_id FROM users WHERE id = $1",
            [decoded.userId]
        );
        const user = result.rows[0];

        if (!user) {
            throw new ApiError(401, "User not found for token");
        }

        req.user = {
            id: user.id,
            role: user.role,
            wardId: user.ward_id,
            departmentId: user.department_id,
        };

        next();
    } catch (error) {
        next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token"));
    }
};

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User, UserRole } from "../models/user.model";
import { ApiError } from "../utils/ApiError";

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

        const user = await User.findById(decoded.userId).select(
            "_id role wardId departmentId"
        );

        if (!user) {
            throw new ApiError(401, "User not found for token");
        }

        req.user = {
            id: user._id.toString(),
            role: user.role,
            wardId: user.wardId?.toString(),
            departmentId: user.departmentId?.toString(),
        };

        next();
    } catch (error) {
        next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token"));
    }
};

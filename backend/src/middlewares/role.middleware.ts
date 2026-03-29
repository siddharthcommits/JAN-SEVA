import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../models/user.model";

export const requireRoles = (...roles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized request"));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, "Forbidden: insufficient permissions"));
        }

        return next();
    };
};

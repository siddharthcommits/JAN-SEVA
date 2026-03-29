import { NextFunction, Request, Response } from "express";
import { ApiError } from "./ApiError";

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

export const asyncHandler =
    (fn: AsyncRequestHandler) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            return await fn(req, res, next);
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({
                    success: error.success,
                    message: error.message,
                    data: error.data,
                });
            }

            // Handle generic errors
            return res.status(500).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal Server Error",
            });
        }
    };

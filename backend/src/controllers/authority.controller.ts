import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Issue } from "../models/issue.model";
import { User } from "../models/user.model";

export const getAuthorityIssues = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const conditions: Record<string, unknown>[] = [];

    if (req.user.departmentId) {
        conditions.push({ departmentId: req.user.departmentId });
    }

    if (req.user.wardId) {
        conditions.push({ wardId: req.user.wardId });
    }

    if (conditions.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No ward or department assigned for this authority"));
    }

    const issues = await Issue.find({ $or: conditions })
        .populate("reportedBy", "name email role")
        .populate("wardId", "name wardNumber city state")
        .populate("departmentId", "name")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, issues, "Authority issues fetched successfully"));
});

export const getAuthorityLeaderboard = asyncHandler(async (_req: Request, res: Response) => {
    const leaderboard = await User.find({ role: "authority" })
        .select("name email phone points issuesResolved wardId departmentId")
        .populate("wardId", "name wardNumber city state")
        .populate("departmentId", "name")
        .sort({ points: -1, issuesResolved: -1, createdAt: 1 });

    return res
        .status(200)
        .json(new ApiResponse(200, leaderboard, "Authority leaderboard fetched successfully"));
});

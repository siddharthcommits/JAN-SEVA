import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Issue } from "../models/issue.model";
import { User } from "../models/user.model";
import { Ward } from "../models/ward.model";
import { Department } from "../models/department.model";

export const getAuthorityIssues = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    if (!req.user.departmentId) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No department assigned for this authority"));
    }

    // Authorities see ALL issues in their department, regardless of ward/locality
    const issues = await Issue.find({ departmentId: req.user.departmentId })
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

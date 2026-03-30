import mongoose from "mongoose";
import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Issue } from "../models/issue.model";
import { Vote } from "../models/vote.model";
import { Comment } from "../models/comment.model";
import { User } from "../models/user.model";
import { Ward } from "../models/ward.model";
import { Department } from "../models/department.model";

const validCategories = ["road", "garbage", "sewage", "water", "electricity"];

const ensureObjectId = (id: string, fieldName: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
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

    if (!validCategories.includes(category)) {
        throw new ApiError(400, "Invalid category");
    }

    ensureObjectId(wardId, "wardId");
    ensureObjectId(departmentId, "departmentId");

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new ApiError(400, "latitude and longitude must be valid numbers");
    }

    const issue = await Issue.create({
        title,
        description,
        category,
        images,
        location: {
            type: "Point",
            coordinates: [lng, lat],
        },
        wardId,
        departmentId,
        reportedBy: req.user.id,
        status: "open",
        upvotes: 0,
        downvotes: 0,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, issue, "Issue reported successfully"));
});

export const getIssues = asyncHandler(async (req: Request, res: Response) => {
    const { category, ward, wardId, department, departmentId, status, sort, limit } = req.query;

    const filters: Record<string, unknown> = {};

    if (category) {
        filters.category = category;
    }
    if (ward || wardId) {
        const wardValue = (ward || wardId) as string;
        ensureObjectId(wardValue, "ward");
        filters.wardId = wardValue;
    }
    if (department || departmentId) {
        const departmentValue = (department || departmentId) as string;
        ensureObjectId(departmentValue, "department");
        filters.departmentId = departmentValue;
    }
    if (status) {
        filters.status = status;
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "upvotes") {
        sortOption = { upvotes: -1 };
    }

    let query = Issue.find(filters)
        .populate("reportedBy", "name email role avatar")
        .populate("wardId", "name wardNumber city state")
        .populate("departmentId", "name")
        .sort(sortOption);

    if (limit) {
        const limitNum = parseInt(limit as string, 10);
        if (!Number.isNaN(limitNum) && limitNum > 0) {
            query = query.limit(limitNum);
        }
    }

    const issues = await query;

    // Attach comment counts
    const issueIds = issues.map((i) => i._id);
    const commentCounts = await Comment.aggregate([
        { $match: { issueId: { $in: issueIds } } },
        { $group: { _id: "$issueId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(commentCounts.map((c) => [c._id.toString(), c.count]));

    const issuesWithComments = issues.map((issue) => {
        const obj = issue.toObject();
        (obj as any).commentCount = countMap.get(issue._id.toString()) || 0;
        return obj;
    });

    return res.status(200).json(new ApiResponse(200, issuesWithComments, "Issues fetched successfully"));
});

export const getIssueById = asyncHandler(async (req: Request, res: Response) => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    ensureObjectId(id, "Issue id");

    const issue = await Issue.findById(id)
        .populate("reportedBy", "name email role avatar")
        .populate("wardId", "name wardNumber city state")
        .populate("departmentId", "name description")
        .populate("resolvedBy", "name email role");

    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }

    const commentCount = await Comment.countDocuments({ issueId: id });
    const issueObj = issue.toObject();
    (issueObj as any).commentCount = commentCount;

    return res.status(200).json(new ApiResponse(200, issueObj, "Issue fetched successfully"));
});

export const getNearbyIssues = asyncHandler(async (req: Request, res: Response) => {
    const { latitude, longitude, radius } = req.query;

    const lat = Number(latitude);
    const lng = Number(longitude);
    const radiusInMeters = Number(radius);

    if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radiusInMeters) || radiusInMeters <= 0) {
        throw new ApiError(400, "latitude, longitude and radius must be valid positive numbers");
    }

    const issues = await Issue.find({
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
                $maxDistance: radiusInMeters,
            },
        },
    })
        .populate("reportedBy", "name email role avatar")
        .populate("wardId", "name wardNumber city state")
        .populate("departmentId", "name")
        .sort({ createdAt: -1 });

    // Attach comment counts
    const issueIds = issues.map((i) => i._id);
    const commentCounts = await Comment.aggregate([
        { $match: { issueId: { $in: issueIds } } },
        { $group: { _id: "$issueId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(commentCounts.map((c) => [c._id.toString(), c.count]));

    const issuesWithComments = issues.map((issue) => {
        const obj = issue.toObject();
        (obj as any).commentCount = countMap.get(issue._id.toString()) || 0;
        return obj;
    });

    return res.status(200).json(new ApiResponse(200, issuesWithComments, "Nearby issues fetched successfully"));
});

export const voteOnIssue = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const { vote } = req.body;

    ensureObjectId(id, "Issue id");

    if (vote !== "upvote" && vote !== "downvote") {
        throw new ApiError(400, "vote must be either upvote or downvote");
    }

    const issue = await Issue.findById(id);
    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }

    const existingVote = await Vote.findOne({ issueId: id, userId: req.user.id });

    if (!existingVote) {
        await Vote.create({ issueId: id, userId: req.user.id, voteType: vote });

        if (vote === "upvote") {
            issue.upvotes += 1;
        } else {
            issue.downvotes += 1;
        }

        await issue.save();

        return res
            .status(200)
            .json(new ApiResponse(200, issue, "Vote recorded successfully"));
    }

    if (existingVote.voteType === vote) {
        return res
            .status(200)
            .json(new ApiResponse(200, issue, "Vote unchanged"));
    }

    if (vote === "upvote") {
        issue.upvotes += 1;
        issue.downvotes = Math.max(0, issue.downvotes - 1);
    } else {
        issue.downvotes += 1;
        issue.upvotes = Math.max(0, issue.upvotes - 1);
    }

    existingVote.voteType = vote;
    await existingVote.save();
    await issue.save();

    return res
        .status(200)
        .json(new ApiResponse(200, issue, "Vote updated successfully"));
});

export const resolveIssue = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    ensureObjectId(id, "Issue id");

    const issue = await Issue.findById(id);
    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }

    if (issue.status === "resolved") {
        throw new ApiError(400, "Issue already resolved");
    }

    issue.status = "resolved";
    issue.resolvedBy = new mongoose.Types.ObjectId(req.user.id);
    issue.resolvedAt = new Date();
    await issue.save();

    const pointsEarned = issue.upvotes * 2;

    await User.findByIdAndUpdate(req.user.id, {
        $inc: {
            points: pointsEarned,
            issuesResolved: 1,
        },
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                issue,
                pointsEarned,
            },
            "Issue resolved successfully"
        )
    );
});

// ---- Comments ----

export const addComment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    ensureObjectId(id, "Issue id");

    const { text } = req.body;
    if (!text || !text.trim()) {
        throw new ApiError(400, "Comment text is required");
    }

    const issue = await Issue.findById(id);
    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }

    const comment = await Comment.create({
        issueId: id,
        userId: req.user.id,
        text: text.trim(),
    });

    const populated = await comment.populate("userId", "name email avatar");

    return res
        .status(201)
        .json(new ApiResponse(201, populated, "Comment added successfully"));
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    ensureObjectId(id, "Issue id");

    const comments = await Comment.find({ issueId: id })
        .populate("userId", "name email avatar")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

import mongoose from "mongoose";
import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Issue } from "../models/issue.model";
import { Vote } from "../models/vote.model";
import { User } from "../models/user.model";

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
    const { category, ward, wardId, department, departmentId, status } = req.query;

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

    const issues = await Issue.find(filters)
        .populate("reportedBy", "name email role")
        .populate("wardId", "name wardNumber city state")
        .populate("departmentId", "name")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, issues, "Issues fetched successfully"));
});

export const getIssueById = asyncHandler(async (req: Request, res: Response) => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    ensureObjectId(id, "Issue id");

    const issue = await Issue.findById(id)
        .populate("reportedBy", "name email role")
        .populate("wardId", "name wardNumber city state")
        .populate("departmentId", "name description")
        .populate("resolvedBy", "name email role");

    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }

    return res.status(200).json(new ApiResponse(200, issue, "Issue fetched successfully"));
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
        .populate("wardId", "name wardNumber city state")
        .populate("departmentId", "name")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, issues, "Nearby issues fetched successfully"));
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

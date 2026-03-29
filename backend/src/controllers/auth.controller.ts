import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/user.model";
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

    const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists with this email or phone");
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        phone,
        password,
        role: "citizen",
    });

    const token = signAuthToken({
        userId: user._id.toString(),
        role: user.role,
    });

    const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
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

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = signAuthToken({
        userId: user._id.toString(),
        role: user.role,
    });

    const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        wardId: user.wardId,
        departmentId: user.departmentId,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, { token, user: userData }, "User logged in successfully"));
});

export const ensureValidObjectId = (id: string, name: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `${name} is invalid`);
    }
};

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(req.user.id)
        .select("-password")
        .populate("wardId", "name wardNumber city state")
        .populate("departmentId", "name");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User profile fetched"));
});

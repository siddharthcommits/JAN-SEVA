import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    try{
        res.status(201).json(new ApiResponse(201, null, "User registered successfully"));
    }catch(error){
        throw new ApiError(500, "Failed to register user");
    }
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    try{
        res.status(200).json(new ApiResponse(200, null, "User logged in successfully"));
    }catch(error){
        throw new ApiError(500, "Failed to login user");
    }
});
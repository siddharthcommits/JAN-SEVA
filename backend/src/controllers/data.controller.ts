import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Ward } from "../models/ward.model";
import { Department } from "../models/department.model";

export const getWards = asyncHandler(async (_req: Request, res: Response) => {
    const wards = await Ward.find({}).sort({ wardNumber: 1 });
    return res.status(200).json(new ApiResponse(200, wards, "Wards fetched successfully"));
});

export const getDepartments = asyncHandler(async (_req: Request, res: Response) => {
    const departments = await Department.find({}).sort({ name: 1 });
    return res.status(200).json(new ApiResponse(200, departments, "Departments fetched successfully"));
});

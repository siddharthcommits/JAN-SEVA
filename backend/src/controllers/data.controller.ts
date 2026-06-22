import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { pool } from "../db/pg";

export const getWards = asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(
        'SELECT id AS "_id", name, ward_number AS "wardNumber", city, state FROM wards ORDER BY ward_number ASC'
    );
    return res.status(200).json(new ApiResponse(200, result.rows, "Wards fetched successfully"));
});

export const getDepartments = asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(
        'SELECT id AS "_id", name, description FROM departments ORDER BY name ASC'
    );
    return res.status(200).json(new ApiResponse(200, result.rows, "Departments fetched successfully"));
});

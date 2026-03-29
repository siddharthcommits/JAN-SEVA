import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import ImageKit from "imagekit";

let imagekitInstance: ImageKit | null = null;

const getImageKit = () => {
    if (!imagekitInstance) {
        const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

        if (!publicKey || !privateKey || !urlEndpoint) {
            throw new ApiError(500, "ImageKit credentials are not configured");
        }

        imagekitInstance = new ImageKit({
            publicKey,
            privateKey,
            urlEndpoint,
        });
    }
    return imagekitInstance;
};

export const getImageKitAuth = asyncHandler(async (_req: Request, res: Response) => {
    const imagekit = getImageKit();
    const authParams = imagekit.getAuthenticationParameters();

    return res
        .status(200)
        .json(new ApiResponse(200, authParams, "ImageKit auth params generated"));
});

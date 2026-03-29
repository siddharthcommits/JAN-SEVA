import { Router } from "express";
import { getImageKitAuth } from "../controllers/imagekit.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.get("/auth", verifyJWT, getImageKitAuth);

export { router as imagekitRouter };

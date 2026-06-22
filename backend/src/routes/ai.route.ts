import { Router } from "express";
import {
    analyzeIssueController,
    checkDuplicateController,
    verifyResolutionController,
    getWardInsightsController,
} from "../controllers/ai.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.post("/analyze-issue", verifyJWT, analyzeIssueController);
router.post("/check-duplicate", verifyJWT, checkDuplicateController);
router.post("/verify-resolution", verifyJWT, requireRoles("authority", "admin"), verifyResolutionController);
router.get("/ward-insights", verifyJWT, requireRoles("authority", "admin"), getWardInsightsController);

export { router as aiRouter };

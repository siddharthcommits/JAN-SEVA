import { Router } from "express";
import {
    getAuthorityIssues,
    getAuthorityLeaderboard,
} from "../controllers/authority.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.get("/issues", verifyJWT, requireRoles("authority", "admin"), getAuthorityIssues);
router.get(
    "/leaderboard",
    verifyJWT,
    requireRoles("authority", "admin"),
    getAuthorityLeaderboard
);

export { router as authorityRouter };

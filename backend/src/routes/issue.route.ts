import { Router } from "express";
import {
    createIssue,
    getIssueById,
    getIssues,
    getNearbyIssues,
    resolveIssue,
    voteOnIssue,
    addComment,
    getComments,
} from "../controllers/issue.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.get("/", getIssues);
router.get("/nearby", getNearbyIssues);
router.get("/:id", getIssueById);
router.get("/:id/comments", getComments);

router.post("/", verifyJWT, requireRoles("citizen", "admin", "authority"), createIssue);
router.post("/:id/vote", verifyJWT, voteOnIssue);
router.post("/:id/resolve", verifyJWT, requireRoles("authority", "admin"), resolveIssue);
router.post("/:id/comments", verifyJWT, addComment);

export { router as issueRouter };


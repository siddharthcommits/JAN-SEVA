import { Router } from "express";
import { loginUser, registerUser, getMe } from "../controllers/auth.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyJWT, getMe);

export { router as authRouter };


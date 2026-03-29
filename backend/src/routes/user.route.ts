import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller";

const router = Router();

router.get("/", (req, res) => {
  res.send("User route");
});

router.post("/register", registerUser);
router.post("/login", loginUser);

export {router as userRouter};
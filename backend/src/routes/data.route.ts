import { Router } from "express";
import { getWards, getDepartments } from "../controllers/data.controller";

const router = Router();

router.get("/wards", getWards);
router.get("/departments", getDepartments);

export { router as dataRouter };

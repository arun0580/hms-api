import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/login", asyncHandler(authController.login));

export default router;

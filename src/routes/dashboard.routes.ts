import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authMiddleware);
router.get("/overview", asyncHandler(dashboardController.getOverview));

export default router;

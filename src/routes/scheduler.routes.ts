import { Router } from "express";
import { schedulerController } from "../controllers/scheduler.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authMiddleware);

router.get("/departments", asyncHandler(schedulerController.listDepartments));
router.get("/doctors", asyncHandler(schedulerController.listDoctors));
router.get("/timeline", asyncHandler(schedulerController.getTimeline));
router.get("/appointments/recent", asyncHandler(schedulerController.recentAppointments));
router.get("/availability/compact", asyncHandler(schedulerController.compactAvailability));
router.post("/appointments", asyncHandler(schedulerController.createAppointment));
router.post("/blocks", asyncHandler(schedulerController.createBlock));

export default router;

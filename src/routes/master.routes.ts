import { Router } from "express";
import { masterController } from "../controllers/master.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authMiddleware);

router.get("/doctors", asyncHandler(masterController.listDoctors));
router.get("/departments", asyncHandler(masterController.listDepartments));
router.get("/counters", asyncHandler(masterController.listCounters));
router.patch("/doctors/:id", asyncHandler(masterController.updateDoctor));
router.patch("/departments/:id", asyncHandler(masterController.updateDepartment));
router.patch("/counters/:id", asyncHandler(masterController.updateCounter));

export default router;

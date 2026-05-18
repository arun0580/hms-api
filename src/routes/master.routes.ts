import { Router } from "express";
import { masterController } from "../controllers/master.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authMiddleware);

router.get("/staff", asyncHandler(masterController.listStaff));

router.get("/doctors", asyncHandler(masterController.listDoctors));
router.get("/doctors/:id", asyncHandler(masterController.getDoctor));
router.post("/doctors", asyncHandler(masterController.createDoctor));
router.put("/doctors/:id", asyncHandler(masterController.updateDoctor));
router.delete("/doctors/:id", asyncHandler(masterController.deleteDoctor));
router.patch("/doctors/:id/status", asyncHandler(masterController.updateDoctorStatus));

router.get("/departments", asyncHandler(masterController.listDepartments));
router.post("/departments", asyncHandler(masterController.createDepartment));
router.put("/departments/:id", asyncHandler(masterController.updateDepartment));
router.delete("/departments/:id", asyncHandler(masterController.deleteDepartment));
router.patch("/departments/:id/status", asyncHandler(masterController.updateDepartmentStatus));

router.get("/counters", asyncHandler(masterController.listCounters));
router.post("/counters", asyncHandler(masterController.createCounter));
router.put("/counters/:id", asyncHandler(masterController.updateCounter));
router.delete("/counters/:id", asyncHandler(masterController.deleteCounter));
router.patch("/counters/:id/status", asyncHandler(masterController.updateCounterStatus));

export default router;

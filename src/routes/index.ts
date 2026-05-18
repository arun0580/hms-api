import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import opRegistrationRoutes from "./op-registration.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import masterRoutes from "./master.routes.js";
import schedulerRoutes from "./scheduler.routes.js";
import { uploadController } from "../controllers/upload.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.get("/uploads/:filename", asyncHandler(uploadController.serveFile));

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/op-registrations", opRegistrationRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/master", masterRoutes);
router.use("/scheduler", schedulerRoutes);

export default router;

import { Router } from "express";
import { opRegistrationController } from "../controllers/op-registration.controller.js";
import { uploadController } from "../controllers/upload.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authMiddleware);

router.get("/lookups", asyncHandler(opRegistrationController.getLookups));
router.get("/preview-numbers", asyncHandler(opRegistrationController.previewNumbers));
router.get("/", asyncHandler(opRegistrationController.list));
router.get("/:id", asyncHandler(opRegistrationController.getById));
router.put("/:id", asyncHandler(opRegistrationController.update));
router.post("/", asyncHandler(opRegistrationController.create));
router.post(
  "/upload",
  uploadMiddleware.single("file"),
  asyncHandler(uploadController.uploadFile)
);

export default router;

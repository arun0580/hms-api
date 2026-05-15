import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { randomUUID } from "node:crypto";

const uploadDir = path.resolve("uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const allowedMime = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMime.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, GIF, and PDF files are allowed"));
    }
  },
});

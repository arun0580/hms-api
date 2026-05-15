import type { Request, Response } from "express";
import path from "node:path";
import { HttpError } from "../utils/http-error.js";

export const uploadController = {
  async uploadFile(req: Request, res: Response) {
    if (!req.file) {
      throw HttpError.badRequest("No file uploaded");
    }

    const url = `/api/uploads/${req.file.filename}`;
    res.status(201).json({
      url,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  },

  async serveFile(req: Request, res: Response) {
    const filename = path.basename(req.params.filename as string);
    if (!filename || filename.includes("..")) {
      throw HttpError.badRequest("Invalid filename");
    }
    await new Promise<void>((resolve, reject) => {
      res.sendFile(path.resolve("uploads", filename), (err) => (err ? reject(err) : resolve()));
    });
  },
};

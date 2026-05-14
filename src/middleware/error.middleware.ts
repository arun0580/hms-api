import type { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";
import { logger } from "../utils/logger.js";
import { isProd } from "../config/env.js";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(HttpError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "ValidationError",
      message: "Invalid request payload",
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.name,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  logger.error("Unhandled error", {
    message: (err as Error)?.message,
    stack: (err as Error)?.stack,
  });

  res.status(500).json({
    error: "InternalServerError",
    message: isProd ? "Something went wrong" : (err as Error)?.message ?? "Unknown error",
  });
};

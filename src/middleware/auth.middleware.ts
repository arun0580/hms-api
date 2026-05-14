import type { Request, Response, NextFunction } from "express";
import { authService, type JwtPayload } from "../services/auth.service.js";
import { HttpError } from "../utils/http-error.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(HttpError.unauthorized("Missing or invalid Authorization header"));
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return next(HttpError.unauthorized("Missing bearer token"));
  }

  try {
    req.user = authService.verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

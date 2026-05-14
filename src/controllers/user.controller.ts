import type { Request, Response } from "express";
import { userService } from "../services/user.service.js";
import { HttpError } from "../utils/http-error.js";

export const userController = {
  async me(req: Request, res: Response) {
    if (!req.user) {
      throw HttpError.unauthorized();
    }
    const user = await userService.getById(req.user.sub);
    res.status(200).json({ user });
  },
};

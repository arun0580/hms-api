import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import type { PublicUser } from "./auth.service.js";

export const userService = {
  async getById(id: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw HttpError.notFound("User not found");
    }

    return user;
  },
};

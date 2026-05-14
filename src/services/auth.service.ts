import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.jwt.secret, options);
}

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw HttpError.unauthorized("Invalid email or password");
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      throw HttpError.unauthorized("Invalid email or password");
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, user: toPublicUser(user) };
  },

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.jwt.secret) as JwtPayload;
    } catch {
      throw HttpError.unauthorized("Invalid or expired token");
    }
  },
};

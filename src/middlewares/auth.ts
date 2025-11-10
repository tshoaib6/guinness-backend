
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";

export type Role = "consumer" | "partner" | "admin";

export function requireAuth(roles?: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
    try {
      const token = header.slice(7);
      const payload = jwt.verify(token, env.JWT_SECRET) as any;
      (req as any).user = payload;
      if (roles && !roles.includes(payload.role)) return res.status(403).json({ message: "Forbidden" });
      next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}


import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: "Validation error", issues: err.flatten() });
  }
  const status = err?.status ?? 500;
  const message = err?.message ?? "Internal Server Error";
  if (status >= 500) logger.error(err);
  return res.status(status).json({ message });
}

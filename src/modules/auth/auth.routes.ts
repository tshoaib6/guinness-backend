
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     responses:
 *       201:
 *         description: Created
 * /api/auth/login:
 *   post:
 *     summary: Login and get JWT
 *     responses:
 *       200:
 *         description: OK
 */
import { Router } from "express";
import { login, register } from "./auth.controller";
export const authRouter = Router();
authRouter.post("/register", register);
authRouter.post("/login", login);

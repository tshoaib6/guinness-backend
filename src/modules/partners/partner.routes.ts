
/**
 * @openapi
 * /api/partners:
 *   get:
 *     summary: List active partners
 *     responses:
 *       200: { description: OK }
 */
import { Router } from "express";
import { listPartners } from "./partner.controller";
export const partnerRouter = Router();
partnerRouter.get("/", listPartners);


/**
 * @openapi
 * /api/qr/redeem:
 *   post:
 *     summary: Redeem a QR code
 *     security: [ { bearerAuth: [] } ]
 *     responses: { 200: { description: OK } }
 */
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { redeem } from "./qr.controller";

export const qrRouter = Router();
qrRouter.post("/redeem", requireAuth(["consumer","partner"]), redeem);

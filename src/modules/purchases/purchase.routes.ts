
/**
 * @openapi
 * /api/purchases:
 *   post:
 *     summary: Create a purchase (receipt or QR)
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       201: { description: Created }
 * /api/purchases/me:
 *   get:
 *     summary: Get my purchases
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 */
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { createPurchase, myPurchases } from "./purchase.controller";
export const purchaseRouter = Router();
purchaseRouter.post("/", requireAuth(["consumer","partner"]), createPurchase);
purchaseRouter.get("/me", requireAuth(["consumer","partner"]), myPurchases);

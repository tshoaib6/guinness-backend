
/**
 * @openapi
 * /api/admin/purchases:
 *   get:
 *     summary: List purchases (admin)
 *     security: [ { bearerAuth: [] } ]
 *     responses: { 200: { description: OK } }
 * /api/admin/purchases/{id}/approve:
 *   post:
 *     summary: Approve a purchase
 *     security: [ { bearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true } ]
 *     responses: { 200: { description: OK } }
 */
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { approvePurchase, listPurchases } from "./adminPurchase.controller";

export const adminRouter = Router();
adminRouter.get("/purchases", requireAuth(["admin"]), listPurchases);
adminRouter.post("/purchases/:id/approve", requireAuth(["admin"]), approvePurchase);

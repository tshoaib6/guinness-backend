
import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes";
import { purchaseRouter } from "./modules/purchases/purchase.routes";
import { partnerRouter } from "./modules/partners/partner.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { qrRouter } from "./modules/qr/qr.routes";

export const routes = Router();

routes.use("/auth", authRouter);
routes.use("/partners", partnerRouter);
routes.use("/purchases", purchaseRouter);
routes.use("/admin", adminRouter);
routes.use("/qr", qrRouter);

// health
routes.get("/health", (_req, res) => res.json({ ok: true }));

import { uploadRouter } from "./modules/uploads/s3.routes";
routes.use("/uploads", uploadRouter);

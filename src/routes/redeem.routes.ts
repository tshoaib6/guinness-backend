// routes/redeemRoutes.ts
import { Router } from "express";
import { createRedeemController, getAllRedeemsController, updateRedeemStatusController } from "../controllers/redeem.controller";
import { authenticateAdmin, authenticateUser } from "../middlewares/auth";

const router = Router();

// User redeems a reward
router.post("/redeem", authenticateUser, createRedeemController);

router.get("/geAllRedeems", authenticateUser, getAllRedeemsController);

router.put("/update-status", authenticateAdmin, updateRedeemStatusController);


export default router;

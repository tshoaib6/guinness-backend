// routes/redeemRoutes.ts
import { Router } from "express";
import { createRedeemController, getAllRedeemsController } from "../controllers/redeem.controller";
import { authenticateUser } from "../middlewares/auth";

const router = Router();

// User redeems a reward
router.post("/redeem", authenticateUser, createRedeemController);

router.get("/geAllRedeems", authenticateUser, getAllRedeemsController);


export default router;

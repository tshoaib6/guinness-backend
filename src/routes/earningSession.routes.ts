// routes/qrRoutes.ts
import { Router } from "express";
import {
    createSingleQrSessionController,
    createRoundQrSessionController,
    redeemQrSessionController,
    getSingleQrSessionsController,
    getRoundQrSessionsController,
} from "../controllers/earningSession.controller"; // updated controller import
import { authenticateUser } from "../middlewares/auth";

const router = Router();

// Owner creates a new Single QR code (5 points)
router.post("/create-qr-single", createSingleQrSessionController);

// Owner creates a new Round QR code (30 points)
router.post("/create-qr-round", createRoundQrSessionController);

// Consumer redeems a QR code
router.post("/redeem-qr-code", authenticateUser, redeemQrSessionController);

router.get("/get-all-single-qr", getSingleQrSessionsController);

// Get all Round QR sessions
router.get("/get-all-round-qr", getRoundQrSessionsController);
export default router;

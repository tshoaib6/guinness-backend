// routes/qrRoutes.ts
import { Router } from "express";
import {
    createSingleQrSessionController,
    createRoundQrSessionController,
    redeemQrSessionController,
    getSingleQrSessionsController,
    getRoundQrSessionsController,
    createWholesaleQrSessionController,
    getWholesaleQrSessionsController,
    createBarQrSessionController,
    uploadReceiptSessionController,

} from "../controllers/earningSession.controller";
import { authenticateUser } from "../middlewares/auth";
import multer from "multer";

const router = Router();
const upload = multer(); // in-memory storage (good for Cloudinary)

// Owner creates a new Single QR code (5 points)
router.post("/create-qr-single", createSingleQrSessionController);

// Owner creates a new Round QR code (30 points)
router.post("/create-qr-round", createRoundQrSessionController);

// Owner creates a new Wholesale QR code (50 points)
router.post("/create-qr-wholesale", createWholesaleQrSessionController);

// Consumer redeems a QR code
router.post("/redeem-qr-code", authenticateUser, redeemQrSessionController);

// Get all active Single QR sessions
router.get("/get-all-single-qr", getSingleQrSessionsController);

// Get all active Round QR sessions
router.get("/get-all-round-qr", getRoundQrSessionsController);

// Get all active Wholesale QR sessions
router.get("/get-all-wholesale-qr", getWholesaleQrSessionsController);

router.post("/create-qr-bar", createBarQrSessionController);

router.post("/upload-receipt", authenticateUser, upload.single("image"), uploadReceiptSessionController);

// router.post("/upload-receipt", authenticateUser, uploadReceiptSessionController);
// router.post("/upload-receipt", authenticateUser,);

export default router;

// routes/userHistory.routes.ts
import { Router } from "express";
import {
  recordUserHistoryController,
  getAllUserHistoryController,
  getUserHistoryByUserIdController,
  getUserHistoryByBusinessIdController,
  getBusinessQrHistoryController,
  getBusinessQrStatsController,
} from "../controllers/userHistory.controller";
import { authenticateAdmin, authenticateUser } from "../middlewares/auth";

const router = Router();

// Record a new history
router.post("/recordUserHistory", recordUserHistoryController);

// Admin: Get all histories
router.get("/getAllUserHistory", authenticateAdmin, getAllUserHistoryController);

// Get history by user ID
router.get("/getUserHistoryByUserId/:userId", getUserHistoryByUserIdController);

// Get history by business ID
router.get(
  "/getUserHistoryByBusinessId/:businessId",
  authenticateAdmin,
  getUserHistoryByBusinessIdController,
);

router.get("/getBusinessQrHistory/:businessId", getBusinessQrHistoryController);

router.get("/business-qr-stats/:businessId", getBusinessQrStatsController);

export default router;

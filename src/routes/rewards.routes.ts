// routes/rewardRoutes.ts
import { Router } from "express";
import {
  createRewardController,
  getRewardsByBusinessController,
  getSingleRewardController,
  updateRewardController,
  deleteRewardController,
  getAllRewardsController,
  updateRewardStatusController,
} from "../controllers/rewards.controller";
import { upload } from "../middlewares/upload";
import { authenticateAdmin } from "../middlewares/auth";

const router = Router();

// Create a reward
router.post("/createReward",upload.single("image"),authenticateAdmin, createRewardController);

router.get("/getAllRewards",authenticateAdmin, getAllRewardsController);

router.put("/updateRewardStatus/:rewardId",authenticateAdmin, updateRewardStatusController);


// Get all rewards for a business
router.get("/getRewardsBybusiness/:businessId", getRewardsByBusinessController);

// Get single reward
router.get("/getRewardById/:rewardId", getSingleRewardController);

// Update reward
router.put(
  "/updateReward/:rewardId",
  upload.single("image"),
  authenticateAdmin,
  updateRewardController
);

// Delete reward
router.delete("/deleteReward/:rewardId",authenticateAdmin, deleteRewardController);

export default router;

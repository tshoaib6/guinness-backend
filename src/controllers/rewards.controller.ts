// controllers/rewardController.ts
import { Request, Response } from "express";
import {
  createRewardService,
  getRewardsByBusinessService,
  getSingleRewardService,
  updateRewardService,
  deleteRewardService,
  getAllRewardsService,
  updateRewardStatusService,
} from "../services/rewards.service";
import { uploadToCloudinary } from "../utils/cloudinary";

export const createRewardController = async (req: Request, res: Response) => {
  try {
    let imageUrl = "";

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "rewards");
    }

    const result = await createRewardService({
      ...req.body,
      image: imageUrl,
    });

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllRewardsController = async (req: Request, res: Response) => {
  const result = await getAllRewardsService();
  res.status(result.success ? 200 : 400).json(result);
};

// ---------- Update Reward Status ----------
export const updateRewardStatusController = async (req: Request, res: Response) => {
  try {
    const { rewardId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be boolean" });
    }

    const result = await updateRewardStatusService(rewardId, isActive);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRewardsByBusinessController = async (req: Request, res: Response) => {
  const { businessId } = req.params;

  // Type assertion
  const userRole = (req as any).user?.role || "consumer";

  const result = await getRewardsByBusinessService(businessId, userRole);
  res.status(result.success ? 200 : 404).json(result);
};


export const getSingleRewardController = async (
  req: Request,
  res: Response
) => {
  const { rewardId } = req.params;
  const result = await getSingleRewardService(rewardId);
  res.status(result.success ? 200 : 404).json(result);
};

export const updateRewardController = async (req: Request, res: Response) => {
  try {
    let imageUrl = undefined;

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "rewards");
    }

    const result = await updateRewardService(req.params.rewardId, {
      ...req.body,
      ...(imageUrl && { image: imageUrl }),
    });

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteRewardController = async (req: Request, res: Response) => {
  const { rewardId } = req.params;
  const result = await deleteRewardService(rewardId);
  res.status(result.success ? 200 : 404).json(result);
};

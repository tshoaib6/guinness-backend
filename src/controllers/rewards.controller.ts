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
import { PaginationOptions } from "../utils/pagination";

export const createRewardController = async (req: Request, res: Response) => {
  try {
    let imageUrl = "";

    // Upload image to Cloudinary if provided
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "rewards");
    }

    const result = await createRewardService({
      ...req.body,
      image: imageUrl,
    });

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error("Create Reward Controller Error:", error); // 🔥 Log full error internally

    // Send clean message to frontend
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create reward",
    });
  }
};

export const getAllRewardsController = async (req: Request, res: Response) => {
  try {
    // Extract pagination options from query
    const options: PaginationOptions = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      sortBy: req.query.sortBy ? String(req.query.sortBy) : "createdAt",
      sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc",
      search: req.query.search ? String(req.query.search) : undefined,
    };

    const result = await getAllRewardsService(options);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
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
  try {
    const { businessId } = req.params;

    // Type assertion for user role
    const userRole = (req as any).user?.role || "consumer";

    // Extract pagination options from query
    const options: PaginationOptions = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      sortBy: req.query.sortBy ? String(req.query.sortBy) : "createdAt",
      sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc",
      search: req.query.search ? String(req.query.search) : undefined,
    };

    const result = await getRewardsByBusinessService(businessId, userRole, options);

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
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

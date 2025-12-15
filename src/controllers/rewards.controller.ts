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

    // ✅ Extract filters from query
    const filters = {
      rewardType: req.query.rewardType ? String(req.query.rewardType) : undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : undefined,
      minPoints: req.query.minPoints ? Number(req.query.minPoints) : undefined,
      maxPoints: req.query.maxPoints ? Number(req.query.maxPoints) : undefined,
      expiryBefore: req.query.expiryBefore ? new Date(String(req.query.expiryBefore)) : undefined,
      expiryAfter: req.query.expiryAfter ? new Date(String(req.query.expiryAfter)) : undefined,
    };

    const result = await getAllRewardsService(options, filters);

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
    console.log("🔥 Req Body:", req.body);
    console.log("🔥 Req File:", req.file);

    let updateData: any = { ...req.body };

    // If new image is uploaded, add it
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, "rewards");
      updateData.image = imageUrl;
    }

    console.log("🔥 Final Update Data:", updateData);

    const result = await updateRewardService(req.params.rewardId, updateData);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};


export const deleteRewardController = async (req: Request, res: Response) => {
  const { rewardId } = req.params;
  const result = await deleteRewardService(rewardId);
  res.status(result.success ? 200 : 404).json(result);
};

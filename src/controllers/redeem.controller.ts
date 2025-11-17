import { Response } from "express";
import { createRedeemService, getAllRedeemsService } from "../services/redeem.service";
import  {AuthRequest}  from "../middlewares/auth"; // import our exported interface
import { PaginationOptions } from "../utils/pagination";

export const createRedeemController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { rewardId } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!rewardId) return res.status(400).json({ success: false, message: "Reward ID is required" });

    const result = await createRedeemService(userId, rewardId);

    res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

export const getAllRedeemsController = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    if (!role || !userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 📌 Extract pagination options with correct type casting
    const options: PaginationOptions = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      sortBy: req.query.sortBy ? String(req.query.sortBy) : "createdAt",
      sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc", // <-- FIXED
      search: req.query.search ? String(req.query.search) : undefined, 
    };

    const result = await getAllRedeemsService(role, userId, options);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

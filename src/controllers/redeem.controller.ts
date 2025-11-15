import { Response } from "express";
import { createRedeemService, getAllRedeemsService } from "../services/redeem.service";
import  {AuthRequest}  from "../middlewares/auth"; // import our exported interface

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

    const result = await getAllRedeemsService(role, userId);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};
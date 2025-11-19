import { Response } from "express";
import { createRedeemService, getAllRedeemsService, updateRedeemStatusService } from "../services/redeem.service";
import { AuthRequest } from "../middlewares/auth"; // import our exported interface
import { PaginationOptions } from "../utils/pagination";
interface UpdateRedeemStatusBody {
  redeemId: string;
  status: "pending" | "delivered";
}


export const createRedeemController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { rewardId } = req.body;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!rewardId)
      return res.status(400).json({ success: false, message: "Reward ID is required" });

    const result = await createRedeemService(userId, rewardId);

    if (!result.success || !result.data) {
      return res.status(400).json(result);
    }

    // Safe access because we checked result.data exists
    const redeem = result.data;

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        redeemId: redeem._id,
        reward: redeem.reward,
        business: redeem.business,
        pointsUsed: redeem.pointsUsed,
        status: redeem.status,
        redeemCode: redeem.redeemCode, // show this to user
        createdAt: redeem.createdAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

export const getAllRedeemsController = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    if (!role || !userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 📌 Extract pagination options
    const options: PaginationOptions = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      sortBy: req.query.sortBy ? String(req.query.sortBy) : "createdAt",
      sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc",
      search: req.query.search ? String(req.query.search) : undefined, // keep as is
    };

    // 📌 Optional status filter (pending | delivered)
    const statusQuery = req.query.status;
    let status: "pending" | "delivered" | undefined = undefined;
    if (statusQuery === "pending" || statusQuery === "delivered") {
      status = statusQuery;
    }

    const result = await getAllRedeemsService(role, userId, status, options);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const updateRedeemStatusController = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const body = req.body as unknown as UpdateRedeemStatusBody;
    const { redeemId, status } = body;

    if (!redeemId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Redeem ID and status are required" });
    }

    if (!["pending", "delivered"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const result = await updateRedeemStatusService(redeemId, status);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};
import { Redeem } from "../models/redeem.model";
import { User } from "../models/user.model";
import { Reward } from "../models/rewards.model";
import { PaginationOptions } from "../utils/pagination";

export const createRedeemService = async (userId: string, rewardId: string) => {
  try {
    // Find user
    const user = await User.findById(userId);
    if (!user) return { success: false, message: "User not found" };

    // Find reward
    const reward = await Reward.findById(rewardId);
    if (!reward) return { success: false, message: "Reward not found" };
    if (!reward.isActive) return { success: false, message: "Reward is not active" };

    // Check user points
    if (user.points < reward.pointsRequired) {
      return { success: false, message: "Insufficient points" };
    }

    // Deduct points
    user.points -= reward.pointsRequired;
    await user.save();

    // Create redeem record
    const redeem = await Redeem.create({
      user: user._id,
      reward: reward._id,
      business: reward.business,
      pointsUsed: reward.pointsRequired,
      status: "approved", // auto-approve
    });

    return {
      success: true,
      message: "Reward redeemed successfully",
      data: redeem,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Redeem failed" };
  }
};


export const getAllRedeemsService = async (
  role: string,
  userId?: string,
  options: PaginationOptions = {}
) => {
  try {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    // If role is consumer → show only their redeems
    if (role === "consumer" && userId) {
      query.user = userId;
    }

    // If role is business → show redeems for rewards owned by this business
    if (role === "business" && userId) {
      query["reward.business"] = userId;
    }

    // Get total documents
    const total = await Redeem.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Fetch paginated + populated data
    const redeems = await Redeem.find(query)
      .populate("user", "firstName lastName email phone role")
      .populate({
        path: "reward",
        select: "rewardName pointsRequired rewardType description business",
        populate: { path: "business", select: "name" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      success: true,
      message: "Redeems fetched successfully",
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      data: redeems,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch redeems",
    };
  }
};
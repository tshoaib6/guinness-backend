import { Redeem } from "../models/redeem.model";
import { User } from "../models/user.model";
import { Reward } from "../models/rewards.model";

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


export const getAllRedeemsService = async (role: string, userId?: string) => {
  try {
    let query: any = {};

    // If role is consumer, show only their own redeems
    if (role === "consumer" && userId) {
      query.user = userId;
    }

    // If role is business, show redeems only for rewards of this business
    // This requires reward population, we can filter after populate

    const redeems = await Redeem.find(query)
      .populate("user", "firstName lastName email phone role") // populate user details
      .populate({
        path: "reward",
        select: "rewardName pointsRequired rewardType description business",
        populate: { path: "business", select: "name" }, // populate business info in reward
      })
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Redeems fetched successfully",
      data: redeems,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch redeems" };
  }
};
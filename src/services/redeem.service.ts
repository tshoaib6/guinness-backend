import { Redeem } from "../models/redeem.model";
import { User } from "../models/user.model";
import { Reward } from "../models/rewards.model";
import { PaginationOptions } from "../utils/pagination";

import crypto from "crypto";
import { redeemSuccessEmailTemplate } from "../templetes/emailTemplates";
import { sendEmail } from "../utils/email";

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

    // Generate unique 8-character redeem code
    const redeemCode = crypto.randomBytes(4).toString("hex").toUpperCase(); // e.g., "9F3A1CDE"

    // Create redeem record
    const redeem = await Redeem.create({
      user: user._id,
      reward: reward._id,
      business: reward.business,
      pointsUsed: reward.pointsRequired,
      status: "pending",
      redeemCode,
    });

    // Prepare user name and email safely
    const userName = user.firstName || user.email || "Valued User";
    const userEmail = user.email || ""; // fallback to empty string to satisfy TS

    if (userEmail) {
      // Send email using template
      const { subject, html } = redeemSuccessEmailTemplate(
        userName,
        reward.rewardName,
        reward.pointsRequired,
        redeemCode,
        "Pending"
      );

      await sendEmail({ to: userEmail, subject, html });
    } else {
      console.warn(`No email found for user ${userId}. Skipping email send.`);
    }

    return {
      success: true,
      message: "Reward redemption request submitted! Email sent successfully.",
      data: redeem,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Redeem failed" };
  }
};
export const getAllRedeemsService = async (
  role: string,
  userId?: string,
  status?: "pending" | "delivered", // pass status separately
  options: PaginationOptions = {}
) => {
  try {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (role === "consumer" && userId) {
      query.user = userId;
    }

    if (role === "business" && userId) {
      query.business = userId;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const total = await Redeem.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

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


export const updateRedeemStatusService = async (
  redeemId: string,
  newStatus: "pending" | "delivered"
) => {
  try {
    const redeem = await Redeem.findById(redeemId);

    if (!redeem) {
      return { success: false, message: "Redeem record not found" };
    }

    // Update status
    redeem.status = newStatus;
    await redeem.save();

    return {
      success: true,
      message: `Redeem status updated to ${newStatus}`,
      data: redeem,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update redeem status",
    };
  }
};
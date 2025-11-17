// services/rewardService.ts
import { Reward } from "../models/rewards.model";
import { Types } from "mongoose";
import { paginate, PaginationOptions } from "../utils/pagination";

export const createRewardService = async (data: any) => {
  try {
    const reward = await Reward.create(data);

    return {
      success: true,
      message: "Reward created successfully",
      data: reward,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create reward",
    };
  }
};

export const getAllRewardsService = async (options: PaginationOptions = {}) => {
  try {
    const query: any = {};

    // 🔍 Optional search by reward name
    if (options.search && options.search.trim() !== "") {
      query.rewardName = { $regex: options.search.trim(), $options: "i" };
    }

    // ✅ Use your paginate utility
    const result = await paginate(Reward, query, options);

    return {
      success: true,
      message: "All rewards fetched successfully",
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      data: result.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch all rewards",
    };
  }
};

export const updateRewardStatusService = async (rewardId: string, isActive: boolean) => {
  try {
    const reward = await Reward.findByIdAndUpdate(
      rewardId,
      { isActive },
      { new: true }
    );

    if (!reward) {
      return {
        success: false,
        message: "Reward not found",
      };
    }

    return {
      success: true,
      message: `Reward is now ${isActive ? "active" : "inactive"}`,
      data: reward,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update reward status",
    };
  }
};

export const getRewardsByBusinessService = async (
  businessId: string,
  userRole: string,
  options: PaginationOptions = {}
) => {
  try {
    const query: any = { business: businessId };

    // Only show active rewards for non-admins
    if (userRole !== "admin") {
      query.isActive = true;
    }

    // Optional search by reward name
    if (options.search && options.search.trim() !== "") {
      query.rewardName = { $regex: options.search.trim(), $options: "i" };
    }

    // Use your paginate utility
    const result = await paginate(Reward, query, options);

    return {
      success: true,
      message: "Rewards fetched successfully",
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      data: result.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch rewards",
    };
  }
};

export const getSingleRewardService = async (rewardId: string) => {
  try {
    const reward = await Reward.findById(rewardId);

    if (!reward) {
      return {
        success: false,
        message: "Reward not found",
      };
    }

    return {
      success: true,
      message: "Reward fetched successfully",
      data: reward,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch reward",
    };
  }
};

export const updateRewardService = async (rewardId: string, updateData: any) => {
  try {
    const reward = await Reward.findByIdAndUpdate(rewardId, updateData, {
      new: true,
    });

    if (!reward) {
      return {
        success: false,
        message: "Reward not found",
      };
    }

    return {
      success: true,
      message: "Reward updated successfully",
      data: reward,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update reward",
    };
  }
};

export const deleteRewardService = async (rewardId: string) => {
  try {
    const reward = await Reward.findByIdAndDelete(rewardId);

    if (!reward) {
      return {
        success: false,
        message: "Reward not found",
      };
    }

    return {
      success: true,
      message: "Reward deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete reward",
    };
  }
};

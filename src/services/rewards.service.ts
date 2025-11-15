// services/rewardService.ts
import { Reward } from "../models/rewards.model";
import { Types } from "mongoose";

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

export const getAllRewardsService = async () => {
  try {
    const rewards = await Reward.find();
    return {
      success: true,
      message: "All rewards fetched successfully",
      data: rewards,
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

export const getRewardsByBusinessService = async (businessId: string, userRole: string) => {
  try {
    let query: any = { business: businessId };

    // If not admin, only show active rewards
    if (userRole !== "admin") {
      query.isActive = true;
    }

    const rewards = await Reward.find(query);

    return {
      success: true,
      message: "Rewards fetched successfully",
      data: rewards,
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

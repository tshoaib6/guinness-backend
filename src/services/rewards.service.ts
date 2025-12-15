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
    console.error("Create Reward Error:", error); // 🔥 Full internal logging

    // 🟦 Mongoose Validation Errors (required fields, enum, min, max, etc.)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return {
        success: false,
        message: messages.join(", "), // send human-readable messages
      };
    }

    // 🟧 Duplicate key error (unique fields)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue).join(", ");
      return {
        success: false,
        message: `The field '${field}' must be unique. This value already exists.`,
      };
    }

    // 🟥 Fallback error for unknown issues
    return {
      success: false,
      message: error.message || "Failed to create reward",
    };
  }
};
interface FilterOptions {
  rewardType?: string;
  isActive?: boolean;
  minPoints?: number;
  maxPoints?: number;
  expiryBefore?: Date;
  expiryAfter?: Date;
}

export const getAllRewardsService = async (
  options: PaginationOptions = {},
  filters: FilterOptions = {}
) => {
  try {
    const query: any = {};

    // ✅ Search by reward name (case-insensitive)
    if (options.search?.trim()) {
      query.rewardName = { $regex: options.search.trim(), $options: "i" };
    }

    // ✅ Filter by rewardType
    if (filters.rewardType) {
      query.rewardType = filters.rewardType;
    }

    // ✅ Filter by isActive
    if (typeof filters.isActive === "boolean") {
      query.isActive = filters.isActive;
    }

    // ✅ Filter by pointsRequired range
    if (filters.minPoints !== undefined || filters.maxPoints !== undefined) {
      query.pointsRequired = {};
      if (filters.minPoints !== undefined) query.pointsRequired.$gte = filters.minPoints;
      if (filters.maxPoints !== undefined) query.pointsRequired.$lte = filters.maxPoints;
    }

    // ✅ Filter by expiryDate
    if (filters.expiryBefore || filters.expiryAfter) {
      query.expiryDate = {};
      if (filters.expiryBefore) query.expiryDate.$lte = filters.expiryBefore;
      if (filters.expiryAfter) query.expiryDate.$gte = filters.expiryAfter;
    }

    // ❗ Step 1: Get paginated results
    const result = await paginate(Reward, query, options);

    // ❗ Step 2: Populate business field after pagination
    const populatedData = await Reward.populate(result.data, {
      path: "business",
      select: "name",
    });

    return {
      success: true,
      message: "All rewards fetched successfully",
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      data: populatedData,
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
    console.log("🔥 Update Service Called");
    console.log("➡ Reward ID:", rewardId);
    console.log("➡ Update Data:", updateData);

    const reward = await Reward.findByIdAndUpdate(rewardId, updateData, {
      new: true,
      runValidators: true,
    });

    console.log("⬅ Updated Document:", reward);

    if (!reward) {
      return { success: false, message: "Reward not found" };
    }

    return {
      success: true,
      message: "Reward updated successfully",
      data: reward,
    };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
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

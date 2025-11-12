import {Business} from "../models/business.model";
import { paginate, PaginationOptions } from "../utils/pagination";

export const createBusiness = async (data: any) => {
  try {
    const existingBusiness = await Business.findOne({ name: data.name });
    if (existingBusiness) {
      return { success: false, message: "Business with this name already exists." };
    }

    const business = new Business(data);
    await business.save();

    return {
      success: true,
      message: "Business created successfully.",
      data: business,
    };
  } catch (error: any) {
    console.error("Create Business Error:", error);
    return { success: false, message: "Failed to create business." };
  }
};


export const getAllBusinesses = async (options: PaginationOptions = {}) => {
  try {
    const query: any = {};

    if (options.search && options.search.trim() !== "") {
      query.name = { $regex: options.search.trim(), $options: "i" }; 
    }

    const result = await paginate(Business, query, options);

    if (!result.data.length) {
      return { success: false, message: "No businesses found." };
    }

    return {
      success: true,
      message: "Businesses fetched successfully.",
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      data: result.data,
    };
  } catch (error: any) {
    console.error("Get All Businesses Error:", error);
    return { success: false, message: "Failed to fetch businesses." };
  }
};


export const getBusinessById = async (id: string) => {
  try {
    const business = await Business.findById(id);
    if (!business) {
      return { success: false, message: "Business not found." };
    }

    return {
      success: true,
      message: "Business fetched successfully.",
      data: business,
    };
  } catch (error: any) {
    console.error("Get Business By ID Error:", error);
    return { success: false, message: "Failed to fetch business." };
  }
};


export const updateBusiness = async (id: string, data: any) => {
  try {
    const updated = await Business.findByIdAndUpdate(id, data, { new: true });
    if (!updated) {
      return { success: false, message: "Business not found or update failed." };
    }

    return {
      success: true,
      message: "Business updated successfully.",
      data: updated,
    };
  } catch (error: any) {
    console.error("Update Business Error:", error);
    return { success: false, message: "Failed to update business." };
  }
};

export const deleteBusiness = async (id: string) => {
  try {
    const deleted = await Business.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, message: "Business not found or already deleted." };
    }

    return {
      success: true,
      message: "Business deleted successfully.",
    };
  } catch (error: any) {
    console.error("Delete Business Error:", error);
    return { success: false, message: "Failed to delete business." };
  }
};

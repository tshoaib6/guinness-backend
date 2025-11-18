// services/businessDetails.service.ts
import { BusinessDetails } from "../models/businessDetails.model";
import { Business } from "../models/business.model";
import { Types } from "mongoose";
import { paginate } from "../utils/pagination";

// --------------------- CREATE BUSINESS DETAILS ---------------------
export const createBusinessDetails = async (data: any) => {
  const { business } = data;

  if (!Types.ObjectId.isValid(business)) {
    return { success: false, message: "Invalid business ID." };
  }

  const businessExists = await Business.findById(business);
  if (!businessExists) {
    return { success: false, message: "Business not found." };
  }

  const alreadyExists = await BusinessDetails.findOne({ business });
  if (alreadyExists) {
    return { success: false, message: "Details already exist for this business." };
  }

  if (data.earnPerPurchase && !Array.isArray(data.earnPerPurchase)) {
    return { success: false, message: "`earnPerPurchase` must be an array." };
  }

  const created = await BusinessDetails.create(data);

  return {
    success: true,
    message: "Business details created successfully.",
    data: created,
  };
};

// --------------------- GET BUSINESS DETAILS BY BUSINESS ID ---------------------
export const getDetailsByBusiness = async (businessId: string) => {
  if (!Types.ObjectId.isValid(businessId)) {
    return { success: false, message: "Invalid business ID." };
  }

  const details = await BusinessDetails.findOne({ business: businessId }).populate("business");

  if (!details) {
    return {
      success: false,
      message: "Details not found for this business.",
    };
  }

  return {
    success: true,
    message: "Business details retrieved successfully.",
    data: details,
  };
};

// --------------------- UPDATE BUSINESS DETAILS ---------------------
export const updateDetails = async (id: string, updateData: any) => {
  if (!Types.ObjectId.isValid(id)) {
    return { success: false, message: "Invalid details ID." };
  }

  if (updateData.earnPerPurchase && !Array.isArray(updateData.earnPerPurchase)) {
    return { success: false, message: "`earnPerPurchase` must be an array." };
  }

  const updated = await BusinessDetails.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updated) {
    return { success: false, message: "Business details not found." };
  }

  return {
    success: true,
    message: "Business details updated successfully.",
    data: updated,
  };
};

// --------------------- DELETE BUSINESS DETAILS ---------------------
export const deleteDetails = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    return { success: false, message: "Invalid details ID." };
  }

  const deleted = await BusinessDetails.findByIdAndDelete(id);

  if (!deleted) {
    return { success: false, message: "Business details not found." };
  }

  return {
    success: true,
    message: "Business details deleted successfully.",
  };
};

// --------------------- GET ALL BUSINESS DETAILS (NEW) ---------------------
export const getAllBusinessDetails = async (options: any) => {
  const { search } = options;

  // Build search query
  let query: any = {};

  if (search) {
    query = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { "grandPrize.title": { $regex: search, $options: "i" } },
      ],
    };
  }

  const result = await paginate(
    BusinessDetails.find().populate("business").model, // ❗ Important trick for population + paginate
    query,
    options
  );

  return {
    success: true,
    message: "All business details retrieved successfully.",
    ...result,
  };
};
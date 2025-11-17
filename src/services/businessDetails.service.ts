// services/businessDetails.service.ts
import { BusinessDetails } from "../models/BusinessDetails.model";
import { Business } from "../models/business.model";
import { Types } from "mongoose";

export class BusinessDetailsService {
  
  // Create Business Details
  static async createBusinessDetails(data: any) {
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

    const created = await BusinessDetails.create(data);

    return {
      success: true,
      message: "Business details created successfully.",
      data: created,
    };
  }

  // Get Business Details by Business ID
  static async getDetailsByBusiness(businessId: string) {
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
  }

  // Update Business Details
  static async updateDetails(id: string, updateData: any) {
    if (!Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid details ID." };
    }

    const updated = await BusinessDetails.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return { success: false, message: "Business details not found." };
    }

    return {
      success: true,
      message: "Business details updated successfully.",
      data: updated,
    };
  }

  // Delete Details
  static async deleteDetails(id: string) {
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
  }
}

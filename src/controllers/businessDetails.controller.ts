// controllers/businessDetails.controller.ts

import { Request, Response } from "express";
import { BusinessDetailsService } from "../services/businessDetails.service";

export const createBusinessDetailsController = async (req: Request, res: Response) => {
  try {
    const result = await BusinessDetailsService.createBusinessDetails(req.body);
    return res.status(result.success ? 200 : 400).json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getBusinessDetailsController = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const result = await BusinessDetailsService.getDetailsByBusiness(businessId);
    return res.status(result.success ? 200 : 404).json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateBusinessDetailsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await BusinessDetailsService.updateDetails(id, req.body);
    return res.status(result.success ? 200 : 400).json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteBusinessDetailsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await BusinessDetailsService.deleteDetails(id);
    return res.status(result.success ? 200 : 400).json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

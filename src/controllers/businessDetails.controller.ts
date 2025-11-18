// controllers/businessDetails.controller.ts

import { Request, Response } from "express";

import { 
  createBusinessDetails,
  getDetailsByBusiness,
  updateDetails,
  deleteDetails,
  getAllBusinessDetails
} from "../services/businessDetails.service";

// ----------------------- CREATE -----------------------
export const createBusinessDetailsController = async (req: Request, res: Response) => {
  try {
    const result = await createBusinessDetails(req.body);
    return res.status(result.success ? 200 : 400).json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ----------------------- GET BY BUSINESS ID -----------------------
export const getBusinessDetailsController = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const result = await getDetailsByBusiness(businessId);
    return res.status(result.success ? 200 : 404).json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ----------------------- UPDATE -----------------------
export const updateBusinessDetailsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await updateDetails(id, req.body);
    return res.status(result.success ? 200 : 400).json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ----------------------- DELETE -----------------------
export const deleteBusinessDetailsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteDetails(id);
    return res.status(result.success ? 200 : 400).json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ----------------------- ⭐ NEW: GET ALL BUSINESS DETAILS -----------------------
// controllers/businessDetails.controller.ts

export const getAllBusinessDetailsController = async (req: Request, res: Response) => {
  try {
    const options = {
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as "asc" | "desc",
      search: req.query.search as string
    };

    const result = await getAllBusinessDetails(options);

    return res.status(200).json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


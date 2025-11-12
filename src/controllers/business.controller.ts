import { Request, Response } from "express";
import { 
  createBusiness, 
  getAllBusinesses, 
  getBusinessById, 
  updateBusiness, 
  deleteBusiness 
} from "../services/business.service";
import { PaginationOptions } from "../utils/pagination";

export const createBusinessController = async (req: Request, res: Response) => {
  const data = req.body;
  const result = await createBusiness(data);
  return res.status(result.success ? 200 : 400).json(result);
};

export const getAllBusinessesController = async (req: Request, res: Response) => {
  try {
    // Extract pagination + search params from query
    const options: PaginationOptions = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as "asc" | "desc",
      search: req.query.search ? (req.query.search as string).trim() : undefined,
    };

    const result = await getAllBusinesses(options);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error: any) {
    console.error("Get All Businesses Controller Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error while fetching businesses." });
  }
};

export const getBusinessByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await getBusinessById(id);
  return res.status(result.success ? 200 : 404).json(result);
};

export const updateBusinessController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const result = await updateBusiness(id, data);
  return res.status(result.success ? 200 : 400).json(result);
};

export const deleteBusinessController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteBusiness(id);
  return res.status(result.success ? 200 : 400).json(result);
};

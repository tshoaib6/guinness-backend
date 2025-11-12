// routes/businessRoutes.ts
import { Router } from "express";
import {
  createBusinessController,
  getAllBusinessesController,
  getBusinessByIdController,
  updateBusinessController,
  deleteBusinessController,
} from "../controllers/business.controller";
import { authenticateAdmin } from "../middlewares/auth"; // Only admin can manage businesses

const router = Router();

// Create a new business
router.post("/createBusiness", authenticateAdmin, createBusinessController);

// Get all businesses
router.get("/getAllBusinesses", getAllBusinessesController);

// Get business by ID
router.get("/getBusinessById/:id", getBusinessByIdController);

// Update business by ID
router.patch("/updateBusiness/:id", authenticateAdmin, updateBusinessController);

// Delete business by ID
router.delete("/deleteBusiness/:id", authenticateAdmin, deleteBusinessController);

export default router;

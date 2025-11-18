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
import upload from "../middlewares/multer"; // <-- Multer import

const router = Router();

// Create a new business
router.post(
  "/createBusiness",
  authenticateAdmin,
  upload.single("icon"),      // <-- Multer added here
  createBusinessController
);
// Get all businesses
router.get("/getAllBusinesses", getAllBusinessesController);

// Get business by ID
router.get("/getBusinessById/:id", getBusinessByIdController);
      
// Update business by ID
router.patch(
  "/updateBusiness/:id",
  authenticateAdmin,
  upload.single("icon"),      // <-- Multer added here
  updateBusinessController
);
// Delete business by ID
router.delete("/deleteBusiness/:id", authenticateAdmin, deleteBusinessController);

export default router;

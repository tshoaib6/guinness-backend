// routes/businessDetails.routes.ts
import { Router } from "express";
import {
  createBusinessDetailsController,
  getBusinessDetailsController,
  updateBusinessDetailsController,
  deleteBusinessDetailsController,
  getAllBusinessDetailsController,
} from "../controllers/businessDetails.controller";

const router = Router();

// CREATE
router.post("/create-business-details", createBusinessDetailsController);

// GET (by business ID)
router.get("/get-business-details-by-id/:businessId", getBusinessDetailsController);

// UPDATE
router.put("/update-business-details/:id", updateBusinessDetailsController);

// DELETE
router.delete("/delete-business-details/:id", deleteBusinessDetailsController);

router.get("/get-all-business-details", getAllBusinessDetailsController);

export default router;

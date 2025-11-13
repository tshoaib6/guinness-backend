// routes/userRoutes.ts
import { Router } from "express";
import {
  registerUserController,
  verifyOtpController,
  loginUserController,
  getPendingBusinessesController,
  approveBusinessController,
  rejectBusinessController,
  forgotPasswordController,
  resetPasswordController,
  resendPasswordResetOtpController,
  getAllUsersController,
  getUserByIdController,
  deleteUserController,
  updateUserStatusController,
  verifyPasswordResetOtpController,
} from "../controllers/user.controller";
import { authenticateAdmin } from "../middlewares/auth"; 
const router = Router();

router.post("/register", registerUserController);      
router.post("/verify-otp", verifyOtpController);       
router.post("/login", loginUserController);            
router.get("/pendingBusinessRequests", authenticateAdmin, getPendingBusinessesController);
router.post("/approveBusiness/:userId", authenticateAdmin, approveBusinessController);
router.post("/rejectBusiness/:userId", authenticateAdmin, rejectBusinessController)
router.post('/forgot-password', forgotPasswordController);
router.post('/verify-password-otp', verifyPasswordResetOtpController); 

router.post('/reset-password', resetPasswordController);
router.post('/resend-password-otp', resendPasswordResetOtpController);
router.get("/getAllUsers", authenticateAdmin, getAllUsersController);
router.get("/getUserById/:id", getUserByIdController);
router.delete("/deleteUserById/:id", deleteUserController);
router.patch("/updateUserStatus", authenticateAdmin, updateUserStatusController );

export default router;

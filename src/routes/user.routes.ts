// routes/userRoutes.ts
import { Router } from 'express';
import { registerUserController, verifyOtpController, loginUserController } from '../controllers/user.controller.ts';

const router = Router();

// Register a new user
router.post('/register', registerUserController);

// Verify OTP after registration
router.post('/verify-otp', verifyOtpController);

// Login user
router.post('/login', loginUserController);

export default router;
 
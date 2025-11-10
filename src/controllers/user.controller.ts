// controllers/userController.ts
import { Request, Response } from 'express';
import { registerUserService, verifyOtpService, loginUserService } from '../services/user.service.ts';

export const registerUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, dob, phone, location, termsAccepted } = req.body;

    if (!firstName || !lastName || !email || !password || !dob || !phone || !location || termsAccepted === undefined) {
      res.status(400).json({
        success: false,
        message: 'All fields (firstName, lastName, email, password, dob, phone, location, termsAccepted) are required.',
      });
      return;
    }

    const result = await registerUserService({ firstName, lastName, email, password, dob, phone, location, termsAccepted });
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while registering. Please try again later.',
    });
  }
};

export const verifyOtpController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP are required.' });
      return;
    }

    const result = await verifyOtpService(email, otp);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during OTP verification. Please try again later.',
    });
  }
};

// ---------------- Login Controller ----------------
export const loginUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const result = await loginUserService({ email, password });
    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during login. Please try again later.',
    });
  }
};

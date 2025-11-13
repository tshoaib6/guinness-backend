import { Request, Response } from "express";
import {
  registerUserService,
  verifyOtpService,
  loginUserService,
  getPendingBusinesses,
  approveBusinessService,
  rejectBusinessService,
  resetPasswordService,
  forgotPasswordService,
  resendPasswordResetOtpService,
  getAllUsersService,
  getUserByIdService,
  deleteUserService,
  updateUserStatusService,
  verifyPasswordResetOtpService,
} from "../services/user.service";

// ---------------- Registration Controller ----------------
export const registerUserController = async (req: Request, res: Response) => {
  try {
    const result = await registerUserService(req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------- OTP Verification Controller ----------------
export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyOtpService(email, otp);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------- Login Controller ----------------
export const loginUserController = async (req: Request, res: Response) => {
  try {
    const result = await loginUserService(req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------- Admin: Get Pending Businesses ----------------
export const getPendingBusinessesController = async (req: Request, res: Response) => {
  try {
    const { page, limit, sortBy, sortOrder, search } = req.query;

    const businesses = await getPendingBusinesses({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as "asc" | "desc") || "desc",
      search: search as string,
    });

    res.status(200).json(businesses);
  } catch (error) {
    console.error("Get pending businesses error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------- Admin: Approve Business ----------------
export const approveBusinessController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await approveBusinessService(userId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Approve business error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------- Admin: Reject Business ----------------
export const rejectBusinessController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await rejectBusinessService(userId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Reject business error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const result = await forgotPasswordService(email);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ---------------- Step 2: Verify Password Reset OTP ----------------
export const verifyPasswordResetOtpController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const result = await verifyPasswordResetOtpService(email, otp);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Verify password reset OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};


// ---------------- Step 3: Reset Password ----------------
export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    // Call service — service will check passwordResetVerified flag
    const result = await resetPasswordService(email, newPassword);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};




// ---------------- Step 4: Resend Password Reset OTP ----------------
export const resendPasswordResetOtpController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const result = await resendPasswordResetOtpService(email);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Resend password reset OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const { page, limit, sortBy, sortOrder, role, email, search } = req.query;

    // Validate role
    let validatedRole: "consumer" | "business" | "admin" | undefined;
    if (role === "consumer" || role === "business" || role === "admin") {
      validatedRole = role;
    }

    const result = await getAllUsersService(
      {
        role: validatedRole,
        email: email as string | undefined,
      },
      {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy: (sortBy as string) || "createdAt",
        sortOrder: (sortOrder as "asc" | "desc") || "desc",
        search: (search as string) || "",
      }
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await getUserByIdService(id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteUserService(id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const updateUserStatusController = async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.body;

    if (!userId || !status || !["active", "blocked"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid input." });

    const result = await updateUserStatusService(userId, status as "active" | "blocked");
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
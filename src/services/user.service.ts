  import { User, IUser } from "../models/user.model";
  import { sendEmail } from "../utils/email";
  import { otpEmailTemplate, passwordResetEmailTemplate, welcomeEmailTemplate } from "../templetes/emailTemplates";
  import bcrypt from "bcrypt";
  import jwt from "jsonwebtoken";
import { paginate, PaginationOptions } from "../utils/pagination";

  interface RegisterUserData {
  role: "consumer" | "business" | "admin";       
    phone: string;
    email: string;
    password: string;
    termsAccepted: boolean;

      // Admin-specific
  adminSecret?: string;

    // Consumer-specific
    firstName?: string;
    lastName?: string;
    dob?: string;
    location?: string;

    // Business-specific
    businessName?: string;       
    businessType?: "Rum Shop" | "Bar" | "Wholesaler";
    registrationNumber?: string;
    ownerName?: string;
    address?: string;
    taxId?: string;
    bankAccount?: string;
  }

  interface LoginUserData {
    email: string;
    password: string;
  }
interface FilterOptions {
  role?: "consumer" | "business" | "admin";
  email?: string;
}
  // ---------------- Helper Functions ----------------
  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  // ---------------- Registration Service ----------------
 export const registerUserService = async (data: RegisterUserData) => {
  const {
    role,
    firstName,
    lastName,
    email,
    password,
    dob,
    phone,
    location,
    termsAccepted,
    businessName,
    businessType,
    registrationNumber,
    ownerName,
    address,
    taxId,
    bankAccount,
    adminSecret,
  } = data;

  // ✅ Password Validation: At least 8 chars, 1 uppercase, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return {
      success: false,
      message:
        "Password must be at least 8 characters long, include one uppercase letter and one number.",
    };
  }

  // ✅ Check if email already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { success: false, message: "This email is already registered." };
  }

  // ✅ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // ✅ Generate OTP
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // ---------- ADMIN REGISTRATION ----------
  if (role === "admin") {
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return { success: false, message: "Invalid admin secret key." };
    }

    const newAdmin = new User({
      role: "admin",
      email,
      phone,
      password: hashedPassword,
      otpVerified: true, // Admin skips OTP
      termsAccepted,
      points: 0,
      status: "active",
    });

    await newAdmin.save();
    return { success: true, message: "Admin registered successfully." };
  }

  // ---------- CONSUMER REGISTRATION ----------
  if (role === "consumer") {
    if (!dob) return { success: false, message: "Date of birth is required." };

    const age = calculateAge(dob);
    if (age < 18) {
      return { success: false, message: "You must be 18 or older to register." };
    }

    const newUser = new User({
      role,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dob: new Date(dob),
      age,
      phone,
      location,
      termsAccepted,
      otp,
      otpExpires,
      otpVerified: false,
      points: 0,
      status: "active",
    });

    await newUser.save();

    // Send OTP email
    const { subject, html } = otpEmailTemplate(firstName || "User", otp);
    await sendEmail({ to: email, subject, html });

    return {
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
    };
  }

  // ---------- BUSINESS REGISTRATION ----------
  if (role === "business") {
    if (!businessName || !businessType || !ownerName || !address) {
      return {
        success: false,
        message:
          "Missing required business fields: businessName, businessType, ownerName, and address.",
      };
    }

    const newBusiness = new User({
      role,
      phone,
      email,
      password: hashedPassword,
      termsAccepted,
      otp,
      otpExpires,
      otpVerified: false,
      businessInfo: {
        businessName,
        businessType,
        registrationNumber,
        ownerName,
        phone,
        email,
        address,
        taxId,
        bankAccount,
        approvedByAdmin: false,
      },
      status: "pending", // Pending until admin approval
    });

    await newBusiness.save();

    const { subject, html } = otpEmailTemplate(ownerName || "Business Owner", otp);
    await sendEmail({ to: email, subject, html });

    return {
      success: true,
      message:
        "Business registration submitted. OTP sent to email. Admin approval required after verification.",
    };
  }

  return { success: false, message: "Invalid role type." };
};


  // ---------------- OTP Verification Service ----------------
export const verifyOtpService = async (email: string, otp: string) => {
  const user = await User.findOne({ email });
  if (!user) return { success: false, message: "User not found." };
  if (user.otpVerified) return { success: false, message: "Email already verified." };
  if (user.otp !== otp) return { success: false, message: "Invalid OTP." };
  if (!user.otpExpires || user.otpExpires < new Date())
    return { success: false, message: "OTP expired." };

  user.otpVerified = true;
  user.otp = null;
  user.otpExpires = null;

  // Update status if needed
  if (user.role === "consumer" || user.role === "admin") {
    user.status = "active"; // Consumers/Admins become active after OTP
  } else if (user.role === "business") {
    user.status = "pending"; // Businesses stay pending until admin approval
  }

  await user.save();

  const { subject, html } = welcomeEmailTemplate(user.firstName || "User");
  await sendEmail({ to: email, subject, html });

  return {
    success: true,
    message: "Email verified successfully! Await admin approval if applicable.",
  };
};


  // ---------------- Login Service ----------------
    export const loginUserService = async ({ email, password }: LoginUserData) => {
      const user = await User.findOne({ email });
      if (!user) return { success: false, message: "User not found." };
      if (!user.otpVerified)
        return { success: false, message: "Email not verified. Please verify first." };

      if (user.role === "business" && !user.businessInfo?.approvedByAdmin) {
        return { success: false, message: "Admin approval pending." };
      }
  if (user.status === "blocked") {
    return { success: false, message: "Your account is blocked. Please contact support." };
  }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return { success: false, message: "Invalid password." };

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message: "Login successful!",
        token,
        user: {
          id: user._id,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          location: user.location,
          businessInfo: user.businessInfo,
          points: user.points,
        },
      };
    };

  // ---------------- Admin: Fetch Pending Businesses ----------------
 export const getPendingBusinesses = async (pagination: PaginationOptions = {}) => {
  const query = {
    role: "business",
    "businessInfo.approvedByAdmin": false,
    otpVerified: true,
  };

  // Only select necessary fields for optimization
  const selectFields = "firstName lastName email phone role businessInfo";

  const result = await paginate(User, query, pagination, selectFields);

  return { success: true, ...result };
};
  // ---------------- Admin: Approve / Reject Business ----------------
  export const approveBusinessService = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user || user.role !== "business") return { success: false, message: "Business not found." };

    user.businessInfo!.approvedByAdmin = true;
    await user.save();
    return { success: true, message: "Business approved successfully." };
  };

  export const rejectBusinessService = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user || user.role !== "business") return { success: false, message: "Business not found." }; 

    await user.deleteOne();
    return { success: true, message: "Business registration rejected and removed." };
  };

export const forgotPasswordService = async (email: string) => {
  // Use indexed query for faster lookup
  const user = await User.findOne({ email }).select("+passwordResetOtp +passwordResetOtpExpires");
  if (!user) return { success: false, message: "User not found." };

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  // Only update if OTP is different or expired
  if (!user.passwordResetOtp || user.passwordResetOtpExpires! < new Date()) {
    user.passwordResetOtp = otp;
    user.passwordResetOtpExpires = otpExpires;
    await user.save();
  }

  const { subject, html } = passwordResetEmailTemplate(user.firstName || "User", otp);
  await sendEmail({ to: email, subject, html });

  return { success: true, message: "OTP sent to your email for password reset." };
};

// ---------------- Resend Password Reset OTP ----------------
export const resendPasswordResetOtpService = async (email: string) => {
  const user = await User.findOne({ email }).select("+passwordResetOtp +passwordResetOtpExpires");
  if (!user) return { success: false, message: "User not found." };

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  user.passwordResetOtp = otp;
  user.passwordResetOtpExpires = otpExpires;
  await user.save();

  const { subject, html } = passwordResetEmailTemplate(user.firstName || "User", otp);
  await sendEmail({ to: email, subject, html });

  return { success: true, message: "New OTP sent to your email for password reset." };
};

// ---------------- Reset Password Using OTP ----------------
export const resetPasswordService = async (email: string, otp: string, newPassword: string) => {
  // Use indexed query for faster lookup
  const user = await User.findOne({ email, passwordResetOtp: otp }).select("+passwordResetOtp +passwordResetOtpExpires");
  if (!user) return { success: false, message: "Invalid email or OTP." };

  if (!user.passwordResetOtpExpires || user.passwordResetOtpExpires < new Date())
    return { success: false, message: "OTP expired. Please request a new one." };

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  // Clear OTP fields
  user.passwordResetOtp = null;
  user.passwordResetOtpExpires = null;

  await user.save();

  return { success: true, message: "Password has been reset successfully." };
};

export const getAllUsersService = async (
  filter: FilterOptions = {},
  pagination: PaginationOptions = {}
) => {
  const query: any = {};
  if (filter.role) query.role = filter.role;
  if (filter.email) query.email = filter.email;

  // Pass search keyword to paginate function
  const result = await paginate(User, query, pagination, "firstName lastName email phone role age location businessInfo.businessName");

  return { success: true, ...result };
};

const USER_FIELDS = "firstName lastName email phone role location points businessInfo";

export const getUserByIdService = async (userId: string) => {
  const user = await User.findById(userId)
    .select(USER_FIELDS)
    .lean(); // lean() returns plain JS object for faster performance

  if (!user) {
    return { success: false, message: "User not found." };
  }

  return { success: true, data: user };
};


export const deleteUserService = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    return { success: false, message: "User not found." };
  }

  await user.deleteOne(); // deletes the document

  return { success: true, message: "User deleted successfully." };
};

export const updateUserStatusService = async (
  userId: string,
  status: "active" | "blocked"
) => {
  const user = await User.findById(userId);
  if (!user) return { success: false, message: "User not found." };

  user.status = status;
  await user.save();

  return {
    success: true,
    message: `User has been ${status === "blocked" ? "blocked" : "unblocked"} successfully.`,
    data: { id: user._id, status: user.status },
  };
};
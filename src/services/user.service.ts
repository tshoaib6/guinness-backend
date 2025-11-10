import { User } from '../models/user.model.ts';
import { sendEmail } from '../utils/email.ts';
import { otpEmailTemplate, welcomeEmailTemplate } from '../templetes/emailTemplates.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dob: string;
  phone: string;
  location: string;
  termsAccepted: boolean;
}

interface LoginUserData {
  email: string;
  password: string;
}

// ---------------- Registration Service ----------------
export const registerUserService = async (data: RegisterUserData) => {
  const { firstName, lastName, email, password, dob, phone, location, termsAccepted } = data;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { success: false, message: 'This email is already registered. Please login or use another email.' };
  }

  // Age verification
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  if (age < 18) return { success: false, message: 'You must be 18 or older to register.' };

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  // Create user
  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    dob: birthDate,
    age,
    phone,
    location,
    termsAccepted,
    otp,
    otpExpires,
    otpVerified: false,
    points: 0,
  });

  await newUser.save();

  // Send OTP email
  const { subject, html } = otpEmailTemplate(firstName, otp);
  await sendEmail({ to: email, subject, html });

  return { success: true, message: 'OTP has been sent to your email. Please verify to complete registration.' };
};

// ---------------- OTP Verification Service ----------------
export const verifyOtpService = async (email: string, otp: string) => {
  const user = await User.findOne({ email });
  if (!user) return { success: false, message: 'User not found. Please register first.' };
  if (user.otpVerified) return { success: false, message: 'Email already verified. Please login.' };
  if (user.otp !== otp) return { success: false, message: 'Invalid OTP. Please check and try again.' };
  if (!user.otpExpires || user.otpExpires < new Date()) return { success: false, message: 'OTP expired. Please request a new one.' };

  // OTP valid, verify user
  user.otpVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  // Send welcome email
  const { subject, html } = welcomeEmailTemplate(user.firstName);
  await sendEmail({ to: email, subject, html });

  return { success: true, message: 'Email verified successfully! You can now login.' };
};

// ---------------- Login Service ----------------
export const loginUserService = async ({ email, password }: LoginUserData) => {
  const user = await User.findOne({ email });
  if (!user) return { success: false, message: 'User not found. Please register first.' };
  if (!user.otpVerified) return { success: false, message: 'Email not verified. Please verify your email first.' };

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return { success: false, message: 'Invalid password. Please try again.' };

  // Generate JWT
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  return {
    success: true,
    message: 'Login successful!',
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      location: user.location,
      points: user.points,
      role: user.role,
    },
  };
};

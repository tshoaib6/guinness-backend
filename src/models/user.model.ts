import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password: string;
  dob?: Date;
  age?: number;
  location?: string;
  role: "consumer" | "business" | "admin";

  businessInfo?: {
    businessName: string;
    businessType: "Rum Shop" | "Bar" | "Wholesaler" | "Supermarket";
    registrationNumber?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    address?: string;
    taxId?: string;
    bankAccount?: string;
    approvedByAdmin: boolean;

    method?: "scan_qr" | "upload_receipt";

    stats?: {
      roundsSold?: number;
      casesSold?: number;
      receiptsUploaded?: number;
      bottlesSold?: number;
    };
  };

  points: number;

  otp: string | null;
  otpExpires: Date | null;
  otpVerified: boolean;
  termsAccepted: boolean;

  passwordResetOtp?: string | null;
  passwordResetOtpExpires?: Date | null;
  passwordResetVerified?: boolean;

  status: "active" | "blocked" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    password: { type: String, required: true },
    dob: { type: Date },
    age: { type: Number },
    location: { type: String },
    role: {
      type: String,
      enum: ["consumer", "business", "admin"],
      default: "consumer",
      required: true,
    },

    businessInfo: {
      businessName: { type: String },
      businessType: {
        type: String,
        enum: ["Rum Shop", "Bar", "Wholesaler", "Supermarket"],
      },
      registrationNumber: { type: String },
      ownerName: { type: String },
      phone: { type: String },
      email: { type: String },
      address: { type: String },
      taxId: { type: String },
      bankAccount: { type: String },
      approvedByAdmin: { type: Boolean, default: false },

      method: {
        type: String,
        enum: ["scan_qr", "upload_receipt"],
        default: "scan_qr",
      },

      stats: {
        roundsSold: { type: Number, default: 0 },
        casesSold: { type: Number, default: 0 },
        receiptsUploaded: { type: Number, default: 0 },
        bottlesSold: { type: Number, default: 0 },
      },
    },

    points: { type: Number, default: 0 },

    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, required: true },

    passwordResetOtp: { type: String, default: null },
    passwordResetOtpExpires: { type: Date, default: null },
    passwordResetVerified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["active", "blocked", "pending"],
      default: "active",
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.dob) {
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  }
  next();
});

userSchema.pre("save", function (next) {
  if (this.businessInfo?.businessType === "Supermarket") {
    this.businessInfo.method = "upload_receipt";
  }
  next();
});

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ role: 1, "businessInfo.approvedByAdmin": 1 });
userSchema.index({ otp: 1 });
userSchema.index({ passwordResetOtp: 1 });
userSchema.index({
  firstName: "text",
  lastName: "text",
  "businessInfo.businessName": "text",
});
userSchema.index({ status: 1 });

export const User = model<IUser>("User", userSchema);

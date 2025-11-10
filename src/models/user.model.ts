import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  password: string;         // hashed password
  dob: Date;
  age?: number;             // calculated from dob
  location: string;
  role: 'consumer' | 'shopkeeper' | 'admin';
  points: number;
  otp: string | null;
  otpExpires: Date | null;
  otpVerified: boolean;
  termsAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true }, // hashed password
    dob: { type: Date, required: true },
    age: { type: Number },
    location: { type: String, required: true },
    role: { type: String, enum: ['consumer', 'shopkeeper', 'admin'], default: 'consumer' },
    points: { type: Number, default: 0 },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, required: true },
  },
  { timestamps: true }
);

// Pre-save hook to calculate age
userSchema.pre('save', function (next) {
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  this.age = age;
  next();
});

export const User = model<IUser>('User', userSchema);
  

import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["consumer", "partner", "admin"], default: "consumer", index: true },
    displayName: { type: String, required: true },
    pointsBalance: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const User = model("User", UserSchema);

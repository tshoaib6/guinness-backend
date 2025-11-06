
import { Schema, model } from "mongoose";

const QrSchema = new Schema(
  {
    code: { type: String, unique: true, index: true },
    type: { type: String, enum: ["bottle","round","case"], required: true },
    partnerId: { type: Schema.Types.ObjectId, ref: "Partner" },
    isActive: { type: Boolean, default: true },
    redeemedBy: { type: Schema.Types.ObjectId, ref: "User" },
    redeemedAt: Date
  }, { timestamps: true }
);
export const QrCode = model("QrCode", QrSchema);

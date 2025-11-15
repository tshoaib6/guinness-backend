import { Schema, model, Document, Types } from "mongoose";

export interface IRedeem extends Document {
  user: Types.ObjectId;
  reward: Types.ObjectId;
  business: Types.ObjectId;
  pointsUsed: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const redeemSchema = new Schema<IRedeem>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reward: {
      type: Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    pointsUsed: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // better default
    },
  },
  { timestamps: true }
);

// Helpful indexes
redeemSchema.index({ user: 1 });
redeemSchema.index({ business: 1 });
redeemSchema.index({ reward: 1 });

export const Redeem = model<IRedeem>("Redeem", redeemSchema);

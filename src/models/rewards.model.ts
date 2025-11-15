import { Schema, model, Document, Types } from "mongoose";

export interface IReward extends Document {
  business: Types.ObjectId;
  rewardName: string;
  pointsRequired: number;
  rewardType: string; // now simple string
  description?: string;
  image?: string;
  expiryDate?: Date;
  quantity?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const rewardSchema = new Schema<IReward>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    rewardName: {
      type: String,
      required: true,
    },
    pointsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    rewardType: {
      type: String, // no enum
      required: true,
    },
    description: { type: String },
    image: { type: String },
    expiryDate: { type: Date },
    quantity: { type: Number },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Useful for performance
rewardSchema.index({ business: 1, isActive: 1 });

export const Reward = model<IReward>("Reward", rewardSchema);

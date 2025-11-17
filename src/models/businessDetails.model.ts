import { Schema, model, Document, Types } from "mongoose";

export interface IBusinessDetails extends Document {
  business: Types.ObjectId;

  title: string;

  summaryStats: {
    label: string;
    value: number;
  }[];

  grandPrize: {
    title: string;
    description: string;
    drawDate: string;
    entryRule: string;
  };

  earnPerPurchase: {
    productName: string;
    size: string;              // "4 x 275ml bottles"
    points: number;            // 40
    entries: number;           // 1
    bonusTip?: string;         // optional
  }[];

  isActive: boolean;
}

const businessDetailsSchema = new Schema<IBusinessDetails>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true,
    },

    title: { type: String, required: true },

    summaryStats: [
      {
        label: { type: String, required: true },
        value: { type: Number, required: true },
      },
    ],

    grandPrize: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      drawDate: { type: String, required: true },
      entryRule: { type: String, required: true },
    },

    earnPerPurchase: [
      {
        productName: { type: String, required: true },
        size: { type: String, required: true },
        points: { type: Number, required: true },
        entries: { type: Number, required: true },
        bonusTip: { type: String },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BusinessDetails = model<IBusinessDetails>(
  "BusinessDetails",
  businessDetailsSchema
);

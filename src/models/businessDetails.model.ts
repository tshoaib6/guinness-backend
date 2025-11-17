import { Schema, model, Document, Types } from "mongoose";

export interface IBusinessDetails extends Document {
  business: Types.ObjectId;  // reference to Business

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

  isActive: boolean;
}

const businessDetailsSchema = new Schema<IBusinessDetails>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true, // ensures one-to-one relation
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

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BusinessDetails = model<IBusinessDetails>("BusinessDetails", businessDetailsSchema);

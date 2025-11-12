import { Schema, model, Document } from "mongoose";

export interface IBusiness extends Document {
  name: string; // e.g., "Supermarket" or "Bar/Restaurant"
  description?: string;
  earnPoints: {
    type: string; // e.g., "per_4_packs", "per_case", "per_round"
    value: number; // number of points awarded
  };
  method: "upload_receipt" | "scan_shop_qr" | "scan_wholesaler_qr" | "manual_entry";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: true,
      enum: ["Supermarket", "Rumshop/Small Store", "Wholesaler", "Bar/Restaurant"],
    },
    description: {
      type: String,
      trim: true,
    },
    earnPoints: {
      type: {
        type: String,
        enum: ["per_4_packs", "per_case", "per_single", "per_round"],
        required: true,
      },
      value: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    method: {
      type: String,
      enum: ["upload_receipt", "scan_shop_qr", "scan_wholesaler_qr", "manual_entry"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Business = model<IBusiness>("Business", businessSchema);

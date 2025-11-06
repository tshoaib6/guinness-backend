
import { Schema, model } from "mongoose";

const PartnerSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["rum_shop", "bar", "wholesaler"], required: true, index: true },
    location: { type: String },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Partner = model("Partner", PartnerSchema);


import { Schema, model } from "mongoose";
const RuleSchema = new Schema(
  {
    channel: { type: String, enum: ["supermarket", "rum_shop", "bar", "wholesaler"], index: true },
    multiplier: { type: Number, required: true, default: 1 },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    dailyCap: { type: Number, default: 0 } // 0 = no cap
  }, { timestamps: true }
);
export const Rule = model("Rule", RuleSchema);

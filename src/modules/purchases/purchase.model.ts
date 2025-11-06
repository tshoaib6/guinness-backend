
import { Schema, model } from "mongoose";
const PurchaseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    partnerId: { type: Schema.Types.ObjectId, ref: "Partner" },
    channel: { type: String, enum: ["supermarket", "rum_shop", "bar", "wholesaler"], required: true, index: true },
    amount: { type: Number, required: true },
    items: [{ sku: String, qty: Number }],
    receiptUrl: String,
    qrCodeId: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved", index: true },
    verifiedAt: Date,
    awardedPoints: { type: Number, default: 0 }
  }, { timestamps: true }
);
export const Purchase = model("Purchase", PurchaseSchema);

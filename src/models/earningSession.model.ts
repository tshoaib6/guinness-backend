import { Schema, model, Document, Types } from "mongoose";

export interface IEarningSession extends Document {
    business: Types.ObjectId;           // The business initiating this session
    type: "qr_scan" | "receipt_upload" | "manual_entry"; // Type of earning action
    value?: string;                     // QR code value or any identifier
    points: number;                     // Points consumer will earn
    expiresAt?: Date;                   // Optional expiration for QR codes
    isActive: boolean;                  // Active session or expired
    meta?: any;                         // Flexible field for future use
    createdAt: Date;
    updatedAt: Date;
}

const earningSessionSchema = new Schema<IEarningSession>(
    {
        business: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["qr_scan", "receipt_upload", "manual_entry", "qr_code_create_single", "qr_code_create_round"],
            required: true,
        },
        value: { type: String },           // QR code value or receipt ID
        points: { type: Number, required: true, min: 1 },
        expiresAt: { type: Date },         // Only needed for QR
        isActive: { type: Boolean, default: true },
        meta: { type: Schema.Types.Mixed }, // For any future additional data
    },
    { timestamps: true }
);

// Indexes for fast lookup
earningSessionSchema.index({ value: 1 });
earningSessionSchema.index({ business: 1, isActive: 1 });
earningSessionSchema.index({ expiresAt: 1 });

export const EarningSession = model<IEarningSession>("EarningSession", earningSessionSchema);

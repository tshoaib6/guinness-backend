import { Schema, model, Document, Types } from "mongoose";

export interface IUserHistory extends Document {
    user: Types.ObjectId;               // The user performing the action (consumer or business)
    relatedBusiness?: Types.ObjectId;   // Business involved (if any)
    session?: Types.ObjectId;           // Link to EarningSession or other relevant session
    actionType: "qr_scan" | "receipt_upload" | "manual_entry" | "points_awarded" | "points_deducted" | "qr_code_create"; // Flexible
    points?: number;                    // Points earned or deducted (optional)
    details?: any;                      // Any extra info, e.g., QR value, receipt ID, meta info
    timestamp: Date;                    // When the action happened
    createdAt: Date;
    updatedAt: Date;
}

const userHistorySchema = new Schema<IUserHistory>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        relatedBusiness: { type: Schema.Types.ObjectId, ref: "User" },
        session: { type: Schema.Types.ObjectId, ref: "EarningSession" },
        actionType: {
            type: String,
            enum: [
                "qr_scan",
                "receipt_upload",
                "manual_entry",
                "points_awarded",
                "points_deducted",
                "qr_code_create"
            ],
            required: true,
        },
        points: { type: Number, default: 0 },
        details: { type: Schema.Types.Mixed }, // Flexible JSON for extra info
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Indexes for optimization
userHistorySchema.index({ user: 1 });
userHistorySchema.index({ relatedBusiness: 1 });
userHistorySchema.index({ session: 1 });
userHistorySchema.index({ actionType: 1, timestamp: -1 });

export const UserHistory = model<IUserHistory>(
    "UserHistory",
    userHistorySchema
);

import { Schema, model, Document, Types } from "mongoose";

export type EarningSessionType =
    | "qr_scan"
    | "receipt_upload"
    | "manual_entry"
    | "qr_code_create_single"
    | "qr_code_create_round"
    | "qr_code_create_wholesale";

export interface IEarningSession extends Document {
    business: Types.ObjectId;
    type: EarningSessionType;
    value?: string;
    points: number;
    expiresAt?: Date;
    isActive: boolean;
    meta?: any;
    createdAt: Date;
    updatedAt: Date;
}

const earningSessionSchema = new Schema<IEarningSession>(
    {
        business: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: [
                "qr_scan",
                "receipt_upload",
                "manual_entry",
                "qr_code_create_single",
                "qr_code_create_round",
                "qr_code_create_wholesale"
            ],
            required: true,
        },
        value: { type: String },
        points: { type: Number, required: true, min: 1 },
        expiresAt: { type: Date },
        isActive: { type: Boolean, default: true },
        meta: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

earningSessionSchema.index({ value: 1 });
earningSessionSchema.index({ business: 1, isActive: 1 });
earningSessionSchema.index({ expiresAt: 1 });

export const EarningSession = model<IEarningSession>("EarningSession", earningSessionSchema);

import { EarningSession } from "../models/earningSession.model";
import { User } from "../models/user.model";
import { Types } from "mongoose";
import crypto from "crypto";
import { recordUserHistoryService } from "./userHistory.service";

// ---------------- Owner: Create Single Guinness QR ----------------
export const createSingleQrSessionService = async (businessId: string) => {
    const points = 5; // points for single
    const qrValue = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const session = new EarningSession({
        business: new Types.ObjectId(businessId),
        type: "qr_code_create_single",
        value: qrValue,
        points,
        expiresAt,
        isActive: true,
        meta: { category: "single" } // optional to track type
    });

    await session.save();

    // Record history for QR creation (owner)
    await recordUserHistoryService({
        userId: businessId,
        actionType: "qr_code_create",
        points,
        sessionId: session._id,
        details: { qrValue, createdBy: "owner", category: "single" }
    });

    return { success: true, data: { qrValue, expiresAt, points, category: "single" } };
};

// ---------------- Owner: Create Round QR ----------------
export const createRoundQrSessionService = async (businessId: string) => {
    const points = 30; // points for round
    const qrValue = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const session = new EarningSession({
        business: new Types.ObjectId(businessId),
        type: "qr_code_create_round",
        value: qrValue,
        points,
        expiresAt,
        isActive: true,
        meta: { category: "round" }
    });

    await session.save();

    // Record history for QR creation (owner)
    await recordUserHistoryService({
        userId: businessId,
        actionType: "qr_code_create",
        points,
        sessionId: session._id,
        details: { qrValue, createdBy: "owner", category: "round" }
    });

    return { success: true, data: { qrValue, expiresAt, points, category: "round" } };
};

// ---------------- Consumer: Redeem QR ----------------
// ---------------- Consumer: Redeem QR ----------------
export const redeemQrSessionService = async (consumerId: string, qrValue: string) => {
    const session = await EarningSession.findOne({
        value: qrValue,
        type: { $in: ["qr_code_create_single", "qr_code_create_round"] }
    });

    if (!session) return { success: false, message: "Invalid QR code." };

    // Check expiry
    if (session.expiresAt && session.expiresAt < new Date()) {
        session.isActive = false; // deactivate only on expiry
        await session.save();
        return { success: false, message: "QR code expired and deactivated." };
    }

    // If manually inactive for any reason
    if (!session.isActive)
        return { success: false, message: "QR code is inactive." };

    const consumer = await User.findById(consumerId);
    if (!consumer) return { success: false, message: "Consumer not found." };

    // Add points to consumer
    consumer.points += session.points;
    await consumer.save();

    // Update rum shop stats
    const owner = await User.findById(session.business);
    if (owner && owner.businessInfo) {
        owner.businessInfo.stats = owner.businessInfo.stats || {};
        owner.businessInfo.stats.roundsSold = (owner.businessInfo.stats.roundsSold || 0) + 1;
        await owner.save();
    }

    // Record history
    await recordUserHistoryService({
        userId: consumerId,
        actionType: "qr_scan",
        points: session.points,
        relatedBusinessId: session.business.toString(),
        sessionId: session._id,
        details: { qrValue, redeemedBy: "consumer", category: session.meta?.category || "unknown" }
    });

    // ❌ Do NOT deactivate after scan
    // session.isActive remains true

    return { success: true, message: "Points added successfully.", points: consumer.points };
};


export const getSingleQrSessionsService = async () => {
    const sessions = await EarningSession.find({
        type: "qr_code_create_single"
    }).sort({ createdAt: -1 });

    for (const s of sessions) {
        if (s.expiresAt && s.expiresAt.getTime() < Date.now() && s.isActive) {
            s.isActive = false;
            await s.save();
        }
    }

    return { success: true, data: sessions };
};

export const getRoundQrSessionsService = async () => {
    const sessions = await EarningSession.find({
        type: "qr_code_create_round"
    }).sort({ createdAt: -1 });

    for (const s of sessions) {
        if (s.expiresAt && s.expiresAt.getTime() < Date.now() && s.isActive) {
            s.isActive = false;
            await s.save();
        }
    }

    return { success: true, data: sessions };
};

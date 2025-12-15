import { EarningSession } from "../models/earningSession.model";
import { User } from "../models/user.model";
import { Types } from "mongoose";
import crypto from "crypto";
import { recordUserHistoryService } from "./userHistory.service";
import { Business } from "../models/business.model";
import { uploadToCloudinary } from "../utils/cloudinary";

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
        meta: { category: "single" }, // optional to track type
    });

    await session.save();

    // Record history for QR creation (owner)
    await recordUserHistoryService({
        userId: businessId,
        actionType: "qr_code_create",
        points,
        sessionId: session._id,
        details: { qrValue, createdBy: "owner", category: "single" },
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
        meta: { category: "round" },
    });

    await session.save();

    // Record history for QR creation (owner)
    await recordUserHistoryService({
        userId: businessId,
        actionType: "qr_code_create",
        points,
        sessionId: session._id,
        details: { qrValue, createdBy: "owner", category: "round" },
    });

    return { success: true, data: { qrValue, expiresAt, points, category: "round" } };
};

export const redeemQrSessionService = async (consumerId: string, qrValue: string) => {
    const session = await EarningSession.findOne({
        value: qrValue,
        type: {
            $in: ["qr_code_create_single", "qr_code_create_round", "qr_code_create_wholesale"],
        },
    });

    if (!session) return { success: false, message: "Invalid QR code." };

    // Check expiry
    if (session.expiresAt && session.expiresAt < new Date()) {
        session.isActive = false;
        await session.save();
        return { success: false, message: "QR code expired and deactivated." };
    }

    if (!session.isActive) return { success: false, message: "QR code is inactive." };

    const consumer = await User.findById(consumerId);
    if (!consumer) return { success: false, message: "Consumer not found." };

    // Add points to consumer
    consumer.points += session.points;
    await consumer.save();

    const owner = await User.findById(session.business);
    if (owner && owner.businessInfo) {
        owner.businessInfo.stats = owner.businessInfo.stats || {};

        const businessType = owner.businessInfo.businessType;

        // Increment stats based on business type
        if (businessType === "Bar") {
            owner.businessInfo.stats.bottlesSold = (owner.businessInfo.stats.bottlesSold || 0) + 1;
        } else if (businessType === "Rum Shop") {
            owner.businessInfo.stats.roundsSold = (owner.businessInfo.stats.roundsSold || 0) + 1;
        } else if (businessType === "Wholesaler") {
            owner.businessInfo.stats.casesSold = (owner.businessInfo.stats.casesSold || 0) + 1;
        }

        await owner.save();
    }

    // Record user history
    await recordUserHistoryService({
        userId: consumerId,
        actionType: "qr_scan",
        points: session.points,
        relatedBusinessId: session.business.toString(),
        sessionId: session._id,
        details: {
            qrValue,
            redeemedBy: "consumer",
            category: session.meta?.category || "unknown",
        },
    });

    return { success: true, message: "Points added successfully.", points: consumer.points };
};

// Get active single QR sessions
export const getSingleQrSessionsService = async () => {
    try {
        const now = new Date();
        const sessions = await EarningSession.find({
            type: "qr_code_create_single",
            isActive: true,
            $or: [
                { expiresAt: { $gt: now } }, // Not expired
                { expiresAt: null }, // No expiration
            ],
        }).sort({ createdAt: -1 });

        return { success: true, data: sessions };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to fetch single QR sessions" };
    }
};

// Get active round QR sessions
export const getRoundQrSessionsService = async () => {
    try {
        const now = new Date();
        const sessions = await EarningSession.find({
            type: "qr_code_create_round",
            isActive: true,
            $or: [
                { expiresAt: { $gt: now } }, // Not expired
                { expiresAt: null }, // No expiration
            ],
        }).sort({ createdAt: -1 });

        return { success: true, data: sessions };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to fetch round QR sessions" };
    }
};

// ---------------- Owner: Create Wholesale QR ----------------
export const createWholesaleQrSessionService = async (businessId: string) => {
    const points = 50; // wholesale points (set whatever you want)
    const qrValue = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const session = new EarningSession({
        business: new Types.ObjectId(businessId),
        type: "qr_code_create_wholesale",
        value: qrValue,
        points,
        expiresAt,
        isActive: true,
        meta: { category: "wholesale" },
    });

    await session.save();

    await recordUserHistoryService({
        userId: businessId,
        actionType: "qr_code_create",
        points,
        sessionId: session._id,
        details: { qrValue, createdBy: "owner", category: "wholesale" },
    });

    return { success: true, data: { qrValue, expiresAt, points, category: "wholesale" } };
};

export const getWholesaleQrSessionsService = async () => {
    try {
        const now = new Date();
        const sessions = await EarningSession.find({
            type: "qr_code_create_wholesale",
            isActive: true,
            $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }],
        }).sort({ createdAt: -1 });

        return { success: true, data: sessions };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to fetch wholesale QR sessions" };
    }
};

// ---------------- Owner: Create Bar QR ----------------
export const createBarQrSessionService = async (businessId: string, points = 5) => {
    const qrValue = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    const session = new EarningSession({
        business: new Types.ObjectId(businessId),
        type: "qr_code_create_single", // use single type for Bar
        value: qrValue,
        points,
        expiresAt,
        isActive: true,
        meta: { category: "bar" }, // mark as Bar
    });

    await session.save();

    // Record history for QR creation (owner)
    await recordUserHistoryService({
        userId: businessId,
        actionType: "qr_code_create",
        points,
        sessionId: session._id,
        details: { qrValue, createdBy: "owner", category: "bar" },
    });

    return { success: true, data: { qrValue, expiresAt, points, category: "bar" } };
};


// export const uploadReceiptSessionService = async (
//     consumerId: string,
//     businessId: string,
//     receiptData: {
//         items: { name: string; quantity: number }[];
//         totalAmount: number;
//         bottleCount?: number;
//         caseCount?: number;
//         type: "single" | "case";
//     }
// ) => {
//     try {
//         const consumer = await User.findById(consumerId);
//         if (!consumer) return { success: false, message: "Consumer not found." };

//         const business = await Business.findById(businessId);
//         if (!business || !business.isActive)
//             return { success: false, message: "Business not found or inactive." };

//         const points = receiptData.type === "single" ? 10 : 50;

//         const session = new EarningSession({
//             business: new Types.ObjectId(businessId),
//             type: "receipt_upload",
//             value: crypto.randomBytes(10).toString("hex"), // invoice/receipt id
//             points,
//             isActive: true,
//             meta: {
//                 category: receiptData.type
//             }
//         });

//         await session.save();

//         consumer.points += points;
//         await consumer.save();

//         if (business.name === "Supermarket") {
//             if (!(business as any).stats) (business as any).stats = {};
//             const stats = (business as any).stats;

//             stats.receiptsUploaded = (stats.receiptsUploaded || 0) + 1;

//             if (receiptData.bottleCount)
//                 stats.bottlesSold = (stats.bottlesSold || 0) + receiptData.bottleCount;

//             if (receiptData.caseCount)
//                 stats.casesSold = (stats.casesSold || 0) + receiptData.caseCount;
//         }

//         await business.save();

//         // ⭐ EXACTLY LIKE QR SCAN ⭐
//         await recordUserHistoryService({
//             userId: consumerId,
//             actionType: "receipt_upload",
//             points,
//             relatedBusinessId: businessId,        // same as QR scan
//             sessionId: session._id,
//             details: session.value                // ONLY invoice id
//         });

//         return {
//             success: true,
//             message: "Receipt processed and points added.",
//             points: consumer.points,
//             sessionId: session._id
//         };

//     } catch (error) {
//         console.error(error);
//         return { success: false, message: "Receipt processing failed." };
//     }
// };

export const uploadReceiptSessionService = async (
    consumerId: string,
    businessId: string,
    receiptData: {
        items: { name: string; quantity: number }[];
        totalAmount: number;
        bottleCount?: number;
        caseCount?: number;
        type:
        | "single"
        | "case_0_25"
        | "case_0_5"
        | "case_0_75"
        | "case_1";
        image?: Buffer | string;
    }
) => {
    try {
        const consumer = await User.findById(consumerId);
        if (!consumer)
            return { success: false, message: "Consumer not found." };

        const business = await Business.findById(businessId);
        if (!business || !business.isActive)
            return { success: false, message: "Business not found or inactive." };

        // ⭐ Points calculation
        let points;
        let caseQuantity = 0;

        switch (receiptData.type) {
            case "single":
                points = 10;
                break;

            case "case_0_25":
                caseQuantity = 0.25;
                points = Math.round(50 * 0.25);
                break;

            case "case_0_5":
                caseQuantity = 0.5;
                points = Math.round(50 * 0.5);
                break;

            case "case_0_75":
                caseQuantity = 0.75;
                points = Math.round(50 * 0.75);
                break;

            case "case_1":
                caseQuantity = 1;
                points = 50;
                break;
        }

        const metaData: any = {
            category: receiptData.type,
            extractedData: receiptData.items,
            totalAmount: receiptData.totalAmount,
            caseQuantity
        };

        let imageUrl: string | undefined;
        if (receiptData.image) {
            imageUrl = await uploadToCloudinary(receiptData.image, "receipts");
            metaData.imageUrl = imageUrl;
        }

        const session = new EarningSession({
            business: new Types.ObjectId(businessId),
            type: "receipt_upload",
            value: crypto.randomBytes(10).toString("hex"),
            points,
            isActive: true,
            meta: metaData,
            status: "approved"
        });

        await session.save();

        consumer.points += points;
        await consumer.save();

        // ⭐ Business stats update
        if (business.name === "Supermarket") {
            if (!(business as any).stats) (business as any).stats = {};
            const stats = (business as any).stats;

            stats.receiptsUploaded = (stats.receiptsUploaded || 0) + 1;

            if (receiptData.bottleCount) {
                stats.bottlesSold =
                    (stats.bottlesSold || 0) + receiptData.bottleCount;
            }

            if (caseQuantity) {
                stats.casesSold = (stats.casesSold || 0) + caseQuantity;
            }

            await business.save();
        }

        await recordUserHistoryService({
            userId: consumerId,
            actionType: "receipt_upload",
            points,
            relatedBusinessId: businessId,
            sessionId: session._id,
            details: JSON.stringify({
                sessionValue: session.value,
                caseQuantity,
                bottleCount: receiptData.bottleCount || 0,
                imageUrl // include the uploaded image
            })
        });

        return {
            success: true,
            message: "Receipt processed and points added.",
            points: consumer.points,
            sessionId: session._id
        };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Receipt processing failed." };
    }
};



export interface GetReceiptsOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    caseType?: string | string[]; // ⭐ new filter

}
export const getAllUploadedReceiptsService = async (
    options: GetReceiptsOptions = {}
) => {
    try {
        const page = options.page && options.page > 0 ? options.page : 1;
        const limit = options.limit && options.limit > 0 ? options.limit : 20;
        const sortBy = options.sortBy || "createdAt";
        const sortOrder = options.sortOrder === "asc" ? 1 : -1;

        // ⭐ Base filter: only receipt_upload sessions
        const filter: any = { type: "receipt_upload" };

        // ⭐ Add caseType filter if provided
        if (options.caseType) {
            if (Array.isArray(options.caseType)) {
                filter["meta.category"] = { $in: options.caseType };
            } else {
                filter["meta.category"] = options.caseType;
            }
        }

        const total = await EarningSession.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        const receipts = await EarningSession.find(filter)
            .populate("business", "businessInfo.businessName businessInfo.businessType")
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return {
            total,
            page,
            limit,
            totalPages,
            data: receipts
        };
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch uploaded receipts");
    }
};
interface UpdateReceiptStatusOptions {
    sessionId: string;
    status: "approved" | "pending" | "rejected";
    adminNotes?: string;
}
export const updateReceiptStatusService = async (
    options: UpdateReceiptStatusOptions
) => {
    try {
        const { sessionId, status, adminNotes } = options;

        // Find the session (lean for efficiency)
        const session = await EarningSession.findById(sessionId).lean();
        if (!session) {
            return { success: false, message: "Receipt session not found." };
        }

        // Update status and adminNotes directly in DB
        await EarningSession.updateOne(
            { _id: sessionId },
            {
                $set: {
                    status,
                    "meta.adminNotes": adminNotes || session.meta?.adminNotes
                }
            }
        );

        // Check userId in meta
        const userId = session.meta?.userId as string | undefined;
        let userIdMissing = false;

        if (userId) {
            await recordUserHistoryService({
                userId,
                actionType: "receipt_status_update",
                points: status === "rejected" ? -session.points : 0,
                relatedBusinessId: session.business.toString(),
                sessionId: session._id.toString(),
                details: `Receipt status changed to ${status}${adminNotes ? `: ${adminNotes}` : ""}`
            });
        } else {
            userIdMissing = true;
            console.warn("No userId found in session.meta. User history not recorded.");
        }

        return { success: true, message: "Receipt status updated successfully.", userIdMissing };
    } catch (error) {
        console.error("Error in updateReceiptStatusService:", error);
        return { success: false, message: "Failed to update receipt status." };
    }
};

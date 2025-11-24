import { UserHistory, IUserHistory } from "../models/userHistory.model";
import { Types } from "mongoose";
import { paginate, PaginationOptions, PaginationResult } from "../utils/pagination";
import { EarningSession } from "../models/earningSession.model";

interface CreateHistoryInput {
    userId: string;
    actionType: IUserHistory["actionType"];
    points?: number;
    relatedBusinessId?: string;
    sessionId?: string;
    details?: any;
}

// Record a new history
export const recordUserHistoryService = async ({
    userId,
    actionType,
    points = 0,
    relatedBusinessId,
    sessionId,
    details = {},
}: CreateHistoryInput) => {
    try {
        const history = new UserHistory({
            user: new Types.ObjectId(userId),
            actionType,
            points,
            relatedBusiness: relatedBusinessId ? new Types.ObjectId(relatedBusinessId) : undefined,
            session: sessionId ? new Types.ObjectId(sessionId) : undefined,
            details,
            timestamp: new Date(),
        });

        await history.save();
        return { success: true, data: history };
    } catch (error) {
        console.error("Error recording user history:", error);
        return { success: false, message: "Failed to record user history" };
    }
};

// Get all history
export const getAllUserHistoryService = async (
    options: PaginationOptions = {}
): Promise<PaginationResult<any>> => {
    try {
        const page = options.page && options.page > 0 ? options.page : 1;
        const limit = options.limit && options.limit > 0 ? options.limit : 20;
        const sortBy = options.sortBy || "createdAt";
        const sortOrder = options.sortOrder === "asc" ? 1 : -1;

        const total = await UserHistory.countDocuments({});
        const totalPages = Math.ceil(total / limit);

        const histories = await UserHistory.find({})
            .populate("user", "firstName lastName role")
            .populate("relatedBusiness", "businessInfo.businessName businessInfo.businessType")
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return { total, page, limit, totalPages, data: histories };
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch histories");
    }
};


// Get user history by user ID with pagination
export const getUserHistoryByUserIdService = async (
    userId: string,
    options: PaginationOptions = {}
): Promise<PaginationResult<any>> => {
    try {
        const query = { user: new Types.ObjectId(userId) };

        // Paginate first
        const result = await paginate(UserHistory, query, options, "");

        // Populate relatedBusiness field with firstName, lastName, role, businessInfo
        const dataWithBusinessInfo = await UserHistory.populate(result.data, [
            {
                path: "relatedBusiness",
                select: "firstName lastName role businessInfo.businessName businessInfo.businessType businessInfo.ownerName businessInfo.registrationNumber",
            },
        ]);

        return {
            ...result,
            data: dataWithBusinessInfo,
        };
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch user history");
    }
};


// Get user history by business ID with pagination
export const getUserHistoryByBusinessIdService = async (
    businessId: string,
    options: PaginationOptions = {}
): Promise<PaginationResult<any>> => {
    try {
        const query = { relatedBusiness: new Types.ObjectId(businessId) };
        return await paginate(UserHistory, query, options, "");
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch business history");
    }
};
export const getBusinessQrHistoryService = async (businessId: string) => {
    try {
        const businessObjectId = new Types.ObjectId(businessId);

        const history = await EarningSession.aggregate([
            // Only QR codes created by this business
            { $match: { business: businessObjectId } },

            // Lookup business info
            {
                $lookup: {
                    from: "users",
                    localField: "business",
                    foreignField: "_id",
                    as: "business",
                },
            },
            { $unwind: "$business" },

            // Lookup scans
            {
                $lookup: {
                    from: "userhistories",
                    let: { sessionId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$session", "$$sessionId"] },
                                actionType: "qr_scan"
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "user",
                                foreignField: "_id",
                                as: "consumer"
                            }
                        },
                        { $unwind: "$consumer" },
                        {
                            $project: {
                                _id: 0,
                                firstName: "$consumer.firstName",
                                lastName: "$consumer.lastName",
                                role: "$consumer.role",
                                qrValue: "$session",
                                scannedAt: "$timestamp",
                                type: "scan",
                                points: "$points", // points earned on scan
                                roundsSold: {
                                    $cond: [{ $eq: ["$consumer.businessInfo.businessType", "Rum Shop"] }, "$consumer.businessInfo.stats.roundsSold", null]
                                },
                                casesSold: {
                                    $cond: [{ $eq: ["$consumer.businessInfo.businessType", "Wholesaler"] }, "$consumer.businessInfo.stats.casesSold", null]
                                }
                            }
                        }
                    ],
                    as: "scans"
                }
            },

            // Project QR created by business
            {
                $project: {
                    _id: 0,
                    businessRecord: {
                        firstName: "$business.firstName",
                        lastName: "$business.lastName",
                        businessName: "$business.businessInfo.businessName",
                        businessType: "$business.businessInfo.businessType",
                        qrValue: "$value",
                        type: "creation",
                        points: "$points", // points assigned for creating this QR
                        roundsSold: {
                            $cond: [{ $eq: ["$business.businessInfo.businessType", "Rum Shop"] }, "$business.businessInfo.stats.roundsSold", null]
                        },
                        casesSold: {
                            $cond: [{ $eq: ["$business.businessInfo.businessType", "Wholesaler"] }, "$business.businessInfo.stats.casesSold", null]
                        }
                    },
                    scans: 1
                }
            },

            // Flatten: business record + scans
            {
                $project: {
                    records: {
                        $concatArrays: [["$businessRecord"], "$scans"]
                    }
                }
            },
            { $unwind: "$records" },
            { $replaceRoot: { newRoot: "$records" } },
            { $sort: { qrValue: 1, scannedAt: 1 } } // Sort by QR then scan time
        ]);

        return { success: true, data: history };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to fetch business QR history." };
    }
};

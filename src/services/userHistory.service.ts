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
export const getBusinessQrHistoryService = async (
    businessId: string,
    options: PaginationOptions = {}
) => {
    try {
        const businessObjectId = new Types.ObjectId(businessId);

        // Run aggregation to get flattened history
        const aggregation = EarningSession.aggregate([
            { $match: { business: businessObjectId } },

            {
                $lookup: {
                    from: "users",
                    localField: "business",
                    foreignField: "_id",
                    as: "business",
                },
            },
            { $unwind: "$business" },

            {
                $lookup: {
                    from: "userhistories",
                    let: { sessionId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$session", "$$sessionId"] }, actionType: "qr_scan" } },
                        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "consumer" } },
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
                                points: "$points",
                            },
                        },
                    ],
                    as: "scans",
                },
            },

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
                        points: "$points",
                    },
                    scans: 1,
                },
            },

            { $project: { records: { $concatArrays: [["$businessRecord"], "$scans"] } } },
            { $unwind: "$records" },
            { $replaceRoot: { newRoot: "$records" } },
            { $sort: { qrValue: 1, scannedAt: 1 } },
        ]);

        // Use your paginate utility
        const allRecords = await aggregation.exec(); // get the full flattened array
        const total = allRecords.length;
        const page = options.page && options.page > 0 ? options.page : 1;
        const limit = options.limit && options.limit > 0 ? options.limit : 20;
        const totalPages = Math.ceil(total / limit);
        const data = allRecords.slice((page - 1) * limit, page * limit);

        return { success: true, data, total, page, limit, totalPages };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to fetch business QR history." };
    }
};


export const getBusinessQrStatsService = async (businessId: string) => {
    try {
        const businessObjectId = new Types.ObjectId(businessId);

        // ------------------ 1. Get all QR sessions of this business ------------------
        const sessions = await EarningSession.find({ business: businessObjectId }, { _id: 1 });
        const sessionIds = sessions.map(s => s._id);

        if (sessionIds.length === 0) {
            return {
                success: true,
                todayCount: 0,
                weeklyCount: 0,
                monthlyCount: 0,
                dailyStats: []
            };
        }

        // ------------------ 2. Fetch all scan records for these sessions ------------------
        const scanRecords = await UserHistory.aggregate([
            {
                $match: {
                    actionType: "qr_scan",
                    session: { $in: sessionIds }
                }
            },
            {
                $project: {
                    scannedAt: "$timestamp"
                }
            }
        ]);

        // ------------------ Prepare Date Ranges ------------------
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        // ------------------ Calculate Stats ------------------

        const todayCount = scanRecords.filter(
            (s) => new Date(s.scannedAt) >= startOfDay
        ).length;

        const weeklyCount = scanRecords.filter(
            (s) => new Date(s.scannedAt) >= last7Days
        ).length;

        const monthlyCount = scanRecords.filter(
            (s) => new Date(s.scannedAt) >= last30Days
        ).length;

        // Past 7 days daily counts
        const dailyStats = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            const count = scanRecords.filter((s) => {
                const scanDate = new Date(s.scannedAt);
                return scanDate >= dayStart && scanDate <= dayEnd;
            }).length;

            return {
                date: dayStart.toISOString().split("T")[0],
                count,
            };
        }).reverse();

        return {
            success: true,
            todayCount,
            weeklyCount,
            monthlyCount,
            dailyStats,
        };

    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to fetch QR stats" };
    }
};

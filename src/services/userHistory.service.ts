import { UserHistory, IUserHistory } from "../models/userHistory.model";
import { Types } from "mongoose";
import { paginate, PaginationOptions, PaginationResult } from "../utils/pagination";

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
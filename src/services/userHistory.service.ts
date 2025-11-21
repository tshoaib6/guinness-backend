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
// Get all user histories with pagination
export const getAllUserHistoryService = async (options: PaginationOptions = {}): Promise<PaginationResult<any>> => {
    try {
        return await paginate(UserHistory, {}, options, "");
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
        return await paginate(UserHistory, query, options, "");
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
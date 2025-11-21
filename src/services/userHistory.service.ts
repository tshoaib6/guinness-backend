import { UserHistory, IUserHistory } from "../models/userHistory.model";
import { Types } from "mongoose";

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
export const getAllUserHistoryService = async () => {
    try {
        const histories = await UserHistory.find().sort({ timestamp: -1 });
        return { success: true, data: histories };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to fetch histories" };
    }
};

// Get history by user ID
export const getUserHistoryByUserIdService = async (userId: string) => {
    try {
        const histories = await UserHistory.find({ user: new Types.ObjectId(userId) }).sort({ timestamp: -1 });
        return { success: true, data: histories };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to fetch user history" };
    }
};

// Get history by business ID
export const getUserHistoryByBusinessIdService = async (businessId: string) => {
    try {
        const histories = await UserHistory.find({ relatedBusiness: new Types.ObjectId(businessId) }).sort({ timestamp: -1 });
        return { success: true, data: histories };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to fetch business history" };
    }
};

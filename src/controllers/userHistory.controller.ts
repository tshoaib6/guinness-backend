import { Request, Response } from "express";
import {
    recordUserHistoryService,
    getAllUserHistoryService,
    getUserHistoryByUserIdService,
    getUserHistoryByBusinessIdService,
} from "../services/userHistory.service";

// Record a new history
export const recordUserHistoryController = async (req: Request, res: Response) => {
    try {
        const { userId, actionType, points, relatedBusinessId, sessionId, details } = req.body;

        if (!userId || !actionType) {
            return res.status(400).json({ success: false, message: "userId and actionType are required" });
        }

        const result = await recordUserHistoryService({
            userId,
            actionType,
            points,
            relatedBusinessId,
            sessionId,
            details,
        });

        if (!result.success) return res.status(500).json(result);

        return res.status(201).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get all history
export const getAllUserHistoryController = async (_req: Request, res: Response) => {
    const result = await getAllUserHistoryService();
    if (!result.success) return res.status(500).json(result);
    return res.status(200).json(result);
};

// Get history by user ID
export const getUserHistoryByUserIdController = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await getUserHistoryByUserIdService(userId);
    if (!result.success) return res.status(500).json(result);
    return res.status(200).json(result);
};

// Get history by business ID
export const getUserHistoryByBusinessIdController = async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const result = await getUserHistoryByBusinessIdService(businessId);
    if (!result.success) return res.status(500).json(result);
    return res.status(200).json(result);
};

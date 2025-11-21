import { Request, Response } from "express";
import {
    recordUserHistoryService,
    getAllUserHistoryService,
    getUserHistoryByUserIdService,
    getUserHistoryByBusinessIdService,
} from "../services/userHistory.service";
import { PaginationOptions } from "../utils/pagination";

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
export const getAllUserHistoryController = async (req: Request, res: Response) => {
    try {
        const options: PaginationOptions = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
            sortBy: String(req.query.sortBy) || "timestamp",
            sortOrder: String(req.query.sortOrder) as "asc" | "desc" || "desc",
            search: String(req.query.search) || undefined,
        };

        const result = await getAllUserHistoryService(options);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch histories" });
    }
};

// Get history by user ID with pagination
export const getUserHistoryByUserIdController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const options: PaginationOptions = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
            sortBy: String(req.query.sortBy) || "timestamp",
            sortOrder: String(req.query.sortOrder) as "asc" | "desc" || "desc",
            search: String(req.query.search) || undefined,
        };

        const result = await getUserHistoryByUserIdService(userId, options);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch user history" });
    }
};

// Get history by business ID with pagination
export const getUserHistoryByBusinessIdController = async (req: Request, res: Response) => {
    try {
        const { businessId } = req.params;
        const options: PaginationOptions = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
            sortBy: String(req.query.sortBy) || "timestamp",
            sortOrder: String(req.query.sortOrder) as "asc" | "desc" || "desc",
            search: String(req.query.search) || undefined,
        };

        const result = await getUserHistoryByBusinessIdService(businessId, options);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch business history" });
    }
};
import { Request, Response } from "express";
import {
    recordUserHistoryService,
    getAllUserHistoryService,
    getUserHistoryByUserIdService,
    getUserHistoryByBusinessIdService,
    getBusinessQrHistoryService,
    getBusinessQrStatsService,
    getUserHistoryByBusinessIdWithoutQrCodeCreateService,

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

export const getBusinessQrHistoryController = async (req: Request, res: Response) => {
    try {
        const { businessId } = req.params;
        if (!businessId) {
            return res.status(400).json({ success: false, message: "Business ID is required" });
        }

        // Extract pagination options from query params
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
        const sortBy = req.query.sortBy ? String(req.query.sortBy) : undefined;
        const sortOrder: "asc" | "desc" = req.query.sortOrder === "asc" ? "asc" : "desc";

        const paginationOptions: PaginationOptions = { page, limit, sortBy, sortOrder };

        // Call the service with pagination options
        const result = await getBusinessQrHistoryService(businessId, paginationOptions);

        return res.status(result.success ? 200 : 500).json({
            success: result.success,
            data: result.data || [],
            total: result.total || 0,
            page: result.page || 1,
            limit: result.limit || 20,
            totalPages: result.totalPages || 1,
            message: result.success
                ? "Business QR history fetched successfully."
                : result.message,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch business QR history" });
    }
};

export const getBusinessQrStatsController = async (req: Request, res: Response) => {
    try {
        const { businessId } = req.params;
        const result = await getBusinessQrStatsService(businessId);

        return res.status(200).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};



export const getUserHistoryByBusinessIdWithoutQrCodeCreateController = async (
    req: Request,
    res: Response
) => {
    try {
        const { businessId } = req.params;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "businessId is required"
            });
        }

        const options = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10,
            sort: {
                createdAt: -1
            }
        };

        const result = await getUserHistoryByBusinessIdWithoutQrCodeCreateService(
            businessId,
            options
        );

        return res.status(200).json({
            success: true,
            message: "Business history fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("getUserHistoryByBusinessIdWithoutQrCodeCreateController:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch business history"
        });
    }
};
// controllers/qrSession.controller.ts
import { Request, Response } from "express";
import {
    createSingleQrSessionService,
    createRoundQrSessionService,
    createWholesaleQrSessionService,   // ✅ NEW
    redeemQrSessionService,
    getSingleQrSessionsService,
    getRoundQrSessionsService,
    getWholesaleQrSessionsService,       // ✅ NEW
    createBarQrSessionService,
    uploadReceiptSessionService,
    getAllUploadedReceiptsService,
    GetReceiptsOptions
} from "../services/earningSession.service";


// ------------------- Single QR -------------------
export const createSingleQrSessionController = async (req: Request, res: Response) => {
    try {
        const { businessId } = req.body;
        if (!businessId) {
            return res.status(400).json({ success: false, message: "businessId is required" });
        }

        const result = await createSingleQrSessionService(businessId);
        return res.status(201).json(result);
    } catch (error) {
        console.error("Error creating Single QR session:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ------------------- Round QR -------------------
export const createRoundQrSessionController = async (req: Request, res: Response) => {
    try {
        const { businessId } = req.body;
        if (!businessId) {
            return res.status(400).json({ success: false, message: "businessId is required" });
        }

        const result = await createRoundQrSessionService(businessId);
        return res.status(201).json(result);
    } catch (error) {
        console.error("Error creating Round QR session:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ------------------- Wholesale QR (NEW) -------------------
export const createWholesaleQrSessionController = async (req: Request, res: Response) => {
    try {
        const { businessId } = req.body;
        if (!businessId) {
            return res.status(400).json({ success: false, message: "businessId is required" });
        }

        const result = await createWholesaleQrSessionService(businessId);
        return res.status(201).json(result);
    } catch (error) {
        console.error("Error creating Wholesale QR session:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ------------------- Redeem QR (Single/Round/Wholesale) -------------------
export const redeemQrSessionController = async (req: Request, res: Response) => {
    try {
        const { consumerId, qrValue } = req.body;
        if (!consumerId || !qrValue) {
            return res.status(400).json({ success: false, message: "consumerId and qrValue are required" });
        }

        const result = await redeemQrSessionService(consumerId, qrValue);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error redeeming QR session:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ------------------- Get Single QR Sessions -------------------
export const getSingleQrSessionsController = async (req: Request, res: Response) => {
    try {
        const result = await getSingleQrSessionsService();
        return res.json(result);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// ------------------- Get Round QR Sessions -------------------
export const getRoundQrSessionsController = async (req: Request, res: Response) => {
    try {
        const result = await getRoundQrSessionsService();
        return res.json(result);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// ------------------- Get Wholesale QR Sessions (NEW) -------------------
export const getWholesaleQrSessionsController = async (req: Request, res: Response) => {
    try {
        const result = await getWholesaleQrSessionsService();
        return res.json(result);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createBarQrSessionController = async (req: Request, res: Response) => {
    try {
        const { businessId } = req.body;

        if (!businessId) {
            return res.status(400).json({ success: false, message: "businessId is required" });
        }

        // Call service with fixed 5 points
        const result = await createBarQrSessionService(businessId, 15);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error("Error creating Bar QR session:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
export const uploadReceiptSessionController = async (
    req: Request,
    res: Response
) => {
    try {
        let { consumerId, businessId, receiptData } = req.body;

        if (!consumerId || !businessId || !receiptData) {
            return res.status(400).json({
                success: false,
                message: "consumerId, businessId and receiptData are required"
            });
        }

        // Parse receiptData if sent via FormData
        if (typeof receiptData === "string") {
            receiptData = JSON.parse(receiptData);
        }

        // ⭐ THIS LINE IS THE KEY FIX
        if (req.file) {
            receiptData.image = req.file.buffer;
        }

        const result = await uploadReceiptSessionService(
            consumerId,
            businessId,
            receiptData
        );

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error("Error uploading receipt session:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



export const getAllUploadedReceiptsController = async (req: Request, res: Response) => {
    try {
        // ⭐ Build options with pagination & sorting
        const options: GetReceiptsOptions = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
            sortBy: String(req.query.sortBy) || "createdAt",
            sortOrder: (String(req.query.sortOrder) as "asc" | "desc") || "desc",
        };

        // ⭐ Handle caseType filter (single or multiple)
        const caseTypeQuery = req.query.caseType;
        if (caseTypeQuery) {
            if (Array.isArray(caseTypeQuery)) {
                // Keep only string elements
                options.caseType = caseTypeQuery.filter((v): v is string => typeof v === "string");
            } else if (typeof caseTypeQuery === "string") {
                // Allow comma-separated string from frontend
                options.caseType = caseTypeQuery.split(",").map(v => v.trim());
            }
        }

        // ⭐ Call service
        const result = await getAllUploadedReceiptsService(options);

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch uploaded receipts" });
    }
};

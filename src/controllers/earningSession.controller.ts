// controllers/qrSession.controller.ts
import { Request, Response } from "express";
import {
    createSingleQrSessionService,
    createRoundQrSessionService,
    redeemQrSessionService,
    getSingleQrSessionsService,
    getRoundQrSessionsService
} from "../services/earningSession.service";

// Owner: Create a new Single QR session (5 points)
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

// Owner: Create a new Round QR session (30 points)
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

// Consumer: Redeem a QR session
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

export const getSingleQrSessionsController = async (req: Request, res: Response) => {
    try {
        const result = await getSingleQrSessionsService();
        return res.json(result);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getRoundQrSessionsController = async (req: Request, res: Response) => {
    try {
        const result = await getRoundQrSessionsService();
        return res.json(result);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
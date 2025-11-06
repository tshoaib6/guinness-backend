
import { Request, Response } from "express";
import { Purchase } from "./purchase.model";
import { calculatePoints } from "../rewards/points.service";

export async function createPurchase(req: Request, res: Response) {
  const { channel, amount, items, receiptUrl, qrCodeId, partnerId } = req.body;
  const userId = (req as any).user?.sub as string | undefined;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const awardedPoints = await calculatePoints(channel, amount);
  const purchase = await Purchase.create({
    channel, amount, items, receiptUrl, qrCodeId, partnerId,
    userId, status: "approved", verifiedAt: new Date(), awardedPoints
  });
  res.status(201).json(purchase);
}

export async function myPurchases(_req: Request, res: Response) {
  const userId = (res.req as any).user?.sub as string | undefined;
  const data = await Purchase.find({ userId }).sort({ createdAt: -1 }).limit(50);
  res.json(data);
}

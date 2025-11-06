
import { Request, Response } from "express";
import { QrCode } from "./qr.model";
import { calculatePoints } from "../rewards/points.service";
import { Purchase } from "../purchases/purchase.model";

export async function redeem(req: Request, res: Response) {
  const { code, channel = "bar", amount = 1 } = req.body as any;
  const userId = (req as any).user?.sub as string | undefined;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const qr = await QrCode.findOne({ code, isActive: true });
  if (!qr) return res.status(400).json({ message: "Invalid or used QR" });
  if (qr.redeemedAt) return res.status(409).json({ message: "QR already redeemed" });

  const awardedPoints = await calculatePoints(channel, amount);
  await Purchase.create({
    userId, partnerId: qr.partnerId, channel, amount, qrCodeId: code,
    status: "approved", verifiedAt: new Date(), awardedPoints
  });

  qr.isActive = false; qr.redeemedBy = userId as any; qr.redeemedAt = new Date();
  await qr.save();

  res.json({ ok: true, awardedPoints });
}

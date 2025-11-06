
import { Request, Response } from "express";
import { Purchase } from "../purchases/purchase.model";

export async function listPurchases(req: Request, res: Response) {
  const { status } = (req.query || {}) as any;
  const filter: any = {};
  if (status) filter.status = status;
  const items = await Purchase.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json(items);
}

export async function approvePurchase(req: Request, res: Response) {
  const { id } = req.params;
  const updated = await Purchase.findByIdAndUpdate(id, { status: "approved", verifiedAt: new Date() }, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
}

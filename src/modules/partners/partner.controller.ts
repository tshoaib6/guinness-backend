
import { Request, Response } from "express";
import { Partner } from "./partner.model";

export async function listPartners(_req: Request, res: Response) {
  const partners = await Partner.find({ active: true }).sort({ name: 1 });
  res.json(partners);
}


import { Rule } from "../rules/rule.model";

export async function calculatePoints(channel: string, amount: number, when = new Date()): Promise<number> {
  const rule = await Rule.findOne({
    channel,
    startAt: { $lte: when },
    endAt: { $gte: when }
  }).sort({ createdAt: -1 });
  const multiplier = rule?.multiplier ?? (channel === "supermarket" ? 10 : channel === "rum_shop" ? 6 : channel === "bar" ? 1 : channel === "wholesaler" ? 50 : 0);
  return Math.floor(amount * multiplier);
}

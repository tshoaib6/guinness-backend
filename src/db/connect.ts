
import mongoose from "mongoose";
import { env } from "../config/env.ts";
import { logger } from "../config/logger.ts";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI);
  logger.info("Mongo connected");
}

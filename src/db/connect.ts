
import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../config/logger";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI);
  logger.info("Mongo connected");
}

// src/server.ts
import dotenv from "dotenv";
dotenv.config(); 

import { app } from "./app.ts";
import { connectDB } from "./db/connect.ts";
import { env } from "./config/env.ts";
import { logger } from "./config/logger.ts";

(async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      logger.info(`API running at http://localhost:${env.PORT}`);
    });
    app.listen(env.PORT, () => {
      logger.info(`API running at http://localhost:${env.PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
})();

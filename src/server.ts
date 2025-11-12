// src/server.ts
import dotenv from "dotenv";
dotenv.config(); 

import  app  from "./app";
import { connectDB } from "./db/connect";
import { env } from "./config/env";
import { logger } from "./config/logger";

(async () => {
  try {
    console.log("connecting to db");
    await connectDB();
 
    app.listen(env.PORT, () => {
      logger.info(`API running at http://localhost:${env.PORT}`);
    });
  } catch (err) {
console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

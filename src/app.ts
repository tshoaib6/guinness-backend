import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs/promises"; 
import { env } from "./config/env.ts";
import { errorMiddleware } from "./middlewares/error.ts";
import { swaggerApp } from "./docs/swagger.ts"; 
import { fileURLToPath } from "url";
import { pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(morgan("dev"));

swaggerApp(app); 

const loadRoutes = async (app: Application, dir: string) => {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      await loadRoutes(app, fullPath);
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
      const routeModule = await import(pathToFileURL(fullPath).href);
      app.use("/api", routeModule.default || routeModule);
    }
  }
};

const routesPath = path.join(__dirname, "routes");

(async () => {
  try {
    await loadRoutes(app, routesPath);
    console.log("Routes loaded successfully");
  } catch (err) {
    console.error("Failed to load routes:", err);
  }
})();

app.use(errorMiddleware);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

export { app };

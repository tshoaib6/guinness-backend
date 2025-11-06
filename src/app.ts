
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { routes } from "./routes";
import { errorMiddleware } from "./middlewares/error";
import { swaggerApp } from "./docs/swagger";

export const app = express();
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: "15mb" }));
app.use(morgan("dev"));

swaggerApp(app); // /docs

app.use("/api", routes);
app.use(errorMiddleware);


import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import type { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Guinness Rewards API",
      version: "1.1.0"
    },
    servers: [{ url: "http://localhost:4000" }]
  },
  apis: ["./src/modules/**/*.routes.ts"]
};

export function swaggerApp(app: Express) {
  const spec = swaggerJSDoc(options as any);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
}

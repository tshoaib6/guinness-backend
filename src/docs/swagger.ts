import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { Application } from "express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Guinness Rewards API",
      version: "1.1.0",
    },
    servers: [{ url: "http://localhost:4000" }],
  },
  apis: ["./src/modules/**/*.routes.ts"],
};

export function swaggerApp(app: Application) {
  const spec = swaggerJSDoc(options);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
}

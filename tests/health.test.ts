
import request from "supertest";
import { app } from "../src/app";
describe("Health", () => {
  it("ok", async () => {
    const res = await request(app).get("/docs");
    expect([200,301,302]).toContain(res.status);
  });
});

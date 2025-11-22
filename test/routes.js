// test/routes.js
import request from "supertest";
import app from "../testserver.js";

describe("GET /locations", () => {
  it("should return an array of locations", async () => {
    const res = await request(app).get("/api/config/locations");
    res.status.should.equal(200);
    res.body.should.be.an("array");
  });
});

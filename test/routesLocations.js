import { expect } from "chai";
import request from "supertest";
import express from "express";

import { newLocation } from "../controllers/configLocationsController.js";
import Location from "../models/configLocations.js";

const app = express();
app.use(express.json());
app.post("/new-location", newLocation);

describe("POST /new-location", () => {
  it("should reject location shorter than MINIMUM_LOCATION_LENGTH", async () => {
    const res = await request(app)
      .post("/new-location")
      .send({ location: "AB" });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message");
  });

  it("should reject blank location", async () => {
    const res = await request(app).post("/new-location").send({ location: "" });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message");
  });

  it("should reject null location", async () => {
    const res = await request(app)
      .post("/new-location")
      .send({ location: null });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message");
  });

  it("should reject empty body", async () => {
    const res = await request(app).post("/new-location").send({});

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message");
  });

  it("should accept a valid location and insert into DB", async () => {
    const res = await request(app)
      .post("/new-location")
      .send({ location: "ABC" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message");

    const found = await Location.findOne({ location: "ABC" });
    expect(found).to.not.be.null;
    expect(found.location).to.equal("ABC");
  });
});

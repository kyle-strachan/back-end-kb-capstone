import { expect } from "chai";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";

import {
  newLocation,
  getLocations,
  editLocations,
} from "../controllers/configLocationsController.js";
import Location from "../models/configLocations.js";

// To test, get post and put

const app = express();
app.use(express.json());
app.post("/new-location", newLocation);
app.get("/locations", getLocations);
app.put("/edit-locations", editLocations);

describe("Location tests", () => {
  before(async () => {
    // Start empty
    await Location.deleteMany({});
  });

  afterEach(async () => {
    // Reset DB between tests
    await Location.deleteMany({});
  });

  // Post tests
  describe("POST /new-location", () => {
    it("should reject location shorter than 3", async () => {
      const res = await request(app)
        .post("/new-location")
        .send({ location: "AB" });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message");
    });

    it("should reject blank location", async () => {
      const res = await request(app)
        .post("/new-location")
        .send({ location: "" });
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
        .send({ location: "Cork" });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message");

      const found = await Location.findOne({ location: "Cork" });
      expect(found).to.not.be.null;
      expect(found.location).to.equal("Cork");
    });

    it("Should trim whitespace from location before saving", async () => {
      const res = await request(app)
        .post("/new-location")
        .send({ location: " Scotland " });
      expect(res.status).to.equal(200);
      const found = await Location.findOne({ location: "Scotland" });
      expect(found).to.not.be.null;
    });
  });

  // Tests for getLocations
  describe("GET /locations", () => {
    it("should return 404 if no locations exist", async () => {
      const res = await request(app).get("/locations");
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("message");
    });

    it("should return sorted list of locations", async () => {
      await Location.create([
        { location: "Kelowna" },
        { location: "Vancouver" },
        { location: "Aberdeen" },
      ]);
      const res = await request(app).get("/locations");
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("locations");
      expect(res.body.locations[0].location).to.equal("Aberdeen");
      expect(res.body.locations[1].location).to.equal("Kelowna");
      expect(res.body.locations[2].location).to.equal("Vancouver");
    });
  });

  // Tests for editLocations
  describe("PUT /edit-locations", () => {
    //  it("should reject if updates array is missing", async () => {
    //   const res = await request(app).put("/edit-locations").send({});
    //   expect(res.status).to.equal(400);
    //   expect(res.body).to.have.property("message");
    // });

    //debugger;

    it("should reject if updates array is missing", async () => {
      const res = await request(app).put("/edit-locations").send({});
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message");
    });

    it("should reject if location is null", async () => {
      const res = await request(app)
        .put("/edit-locations")
        .send({ updates: null });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message");
    });

    it("should reject if updates array is empty", async () => {
      const res = await request(app)
        .put("/edit-locations")
        .send({ updates: [] });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message");
    });

    it("should reject invalid ObjectId", async () => {
      const res = await request(app)
        .put("/edit-locations")
        .send({
          updates: [{ _id: "id1", location: "Somewhere" }],
        });
      expect(res.status).to.equal(200);
      expect(res.body.results[0].success).to.be.false;
    });

    it("should reject too-short location name", async () => {
      const loc = await Location.create({ location: "Somewhere" });
      const res = await request(app)
        .put("/edit-locations")
        .send({
          updates: [{ _id: loc._id.toString(), location: "So" }],
        });
      expect(res.status).to.equal(200);
      expect(res.body.results[0].success).to.be.false;
      expect(res.body.results[0].message).to.include(
        "must be at least 3 characters"
      );
    });

    it("should update location name successfully", async () => {
      const loc = await Location.create({ location: "Somewhere" });
      const res = await request(app)
        .put("/edit-locations")
        .send({
          updates: [{ _id: loc._id.toString(), location: "Somewhere2" }],
        });
      expect(res.status).to.equal(200);
      expect(res.body.results[0].success).to.be.true;

      const updated = await Location.findById(loc._id);
      expect(updated.location).to.equal("Somewhere2");
    });

    it("should update isActive flag successfully", async () => {
      const loc = await Location.create({
        location: "Somewhere",
        isActive: false,
      });
      const res = await request(app)
        .put("/edit-locations")
        .send({
          updates: [
            {
              _id: loc._id.toString(),
              location: "Somewhere",
              isActive: "true",
            },
          ],
        });
      expect(res.status).to.equal(200);
      expect(res.body.results[0].success).to.be.true;

      const updated = await Location.findById(loc._id);
      expect(updated.isActive).to.be.true;
    });

    it("should return failure if location ID not found", async () => {
      const res = await request(app)
        .put("/edit-locations")
        .send({
          updates: [{ _id: "12345678", location: "Somewhere3" }],
        });
      expect(res.status).to.equal(200); //Processing still successful even if all failed results
      expect(res.body.results[0].success).to.be.false;
      expect(res.body.results[0].message).to.include(
        "Invalid ID or location name"
      );
    });
  });
});

import { expect } from "chai";
import request from "supertest";
import express from "express";

import { newDepartment } from "../controllers/configDepartmentsController.js";
import Department from "../models/configDepartments.js";

const app = express();
app.use(express.json());
app.post("/new-department", newDepartment);

describe("POST /new-department", () => {
  it("should reject short department", async () => {
    const res = await request(app)
      .post("/new-department")
      .send({ department: "AB" });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message");
  });

  it("should reject blank department", async () => {
    const res = await request(app)
      .post("/new-department")
      .send({ department: "" });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message");
  });

  it("should reject null department", async () => {
    const res = await request(app)
      .post("/new-department")
      .send({ department: null });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message");
  });

  it("should reject empty body", async () => {
    const res = await request(app).post("/new-department").send({});

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message");
  });

  it("should accept a valid department and insert into DB", async () => {
    const res = await request(app)
      .post("/new-department")
      .send({ department: "ABC" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message");

    const found = await Department.findOne({ department: "ABC" });
    expect(found).to.not.be.null;
    expect(found.department).to.equal("ABC");
  });
});

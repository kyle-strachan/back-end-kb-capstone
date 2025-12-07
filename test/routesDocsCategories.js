import { expect } from "chai";
import request from "supertest";
import express from "express";
import {
  getDocsCategories,
  newDocsCategory,
  editDocsCategory,
} from "../controllers/configDocsCategoriesController.js";
import DocsCategories from "../models/configDocsCategories.js";

const app = express();
const demoDepartment = "690ebd021ee02712c8dcdfb4"; // Front Office

app.use(express.json());

app.get("/docs-categories", (req, res, next) => {
  req.user = { isSuperAdmin: false, roles: [], department: [] };
  return getDocsCategories(req, res, next);
});
app.post("/new-docs-category", (req, res, next) => {
  req.user = { isSuperAdmin: false, department: [demoDepartment] };
  return newDocsCategory(req, res, next);
});
app.put("/edit-docs-category", (req, res, next) => {
  req.user = { isSuperAdmin: false, department: [] };
  return editDocsCategory(req, res, next);
});

app.post("/new-docs-category-super", (req, res, next) => {
  req.user = { isSuperAdmin: true, department: [demoDepartment] };
  return newDocsCategory(req, res, next);
});

describe("Docs Categories Controller", () => {
  before(async () => {
    // Start empty
    await DocsCategories.deleteMany({});
  });

  afterEach(async () => {
    // Reset between tests
    await DocsCategories.deleteMany({});
  });
  it("should reject too short category name", async () => {
    const res = await request(app)
      .post("/new-docs-category")
      .send({ departmentId: demoDepartment, category: "Eg" });
    expect(res.status).to.equal(400);
  });

  it("should reject null category name", async () => {
    const res = await request(app)
      .post("/new-docs-category")
      .send({ departmentId: demoDepartment, category: null });
    expect(res.status).to.equal(400);
  });

  it("should insert new category", async () => {
    const res = await request(app)
      .post("/new-docs-category")
      .send({ departmentId: demoDepartment, category: "Test" });
    expect(res.status).to.equal(200);
  });

  it("should reject duplicate value", async () => {
    await request(app)
      .post("/new-docs-category")
      .send({ departmentId: demoDepartment, category: "Test" })
      .expect(200);

    // Second insert should fail
    const res = await request(app)
      .post("/new-docs-category")
      .send({ departmentId: demoDepartment, category: "Test" });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.include("Cannot create duplicate category.");
  });

  it("should insert new category with trimmed value", async () => {
    const res = await request(app)
      .post("/new-docs-category")
      .send({ departmentId: demoDepartment, category: " Trimmed  " });
    expect(res.status).to.equal(200);
    expect(res.body.message).to.include(`Trimmed created successfully.`);
  });

  it("should return docs categories list", async () => {
    const res = await request(app).get("/docs-categories");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("docsCategories");
  });

  it("should reject adding category into a department where user is not a member", async () => {
    const res = await request(app).post("/new-docs-category").send({
      departmentId: "690ebd051ee02712c8dcdfb6",
      category: "Not A Member",
    });
    expect(res.status).to.equal(403);
  });

  // Test super user override/ doesn't need to be a member
  it("should allow super admin to insert even when user is not a member", async () => {
    const res = await request(app).post("/new-docs-category-super").send({
      departmentId: "690ebd051ee02712c8dcdfb6",
      category: "Not A Member Super Admin",
    });
    expect(res.status).to.equal(200);
  });
});

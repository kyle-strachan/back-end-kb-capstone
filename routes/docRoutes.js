import { Router } from "express";
import {
  getDocs,
  getDoc,
  newDoc,
  editDoc,
  getDocsTree,
  uploadImage,
} from "../controllers/docsController.js";
import { authMiddleware, attachUser } from "../middleware/authMiddleware.js";
// import { noCache } from ...

const router = Router();

// All prefixed /api/docs
router.get("/", authMiddleware, attachUser, getDocs); // Get all docs appropriate of users based on canViewAllDocs etc.
router.get("/tree", authMiddleware, attachUser, getDocsTree); // To output the explorer
router.get("/:id", authMiddleware, attachUser, getDoc); // get single doc
router.post("/:id/upload-image", authMiddleware, attachUser, uploadImage);
router.post("/", authMiddleware, attachUser, newDoc);
router.patch("/edit/:id", authMiddleware, attachUser, editDoc);

export default router;

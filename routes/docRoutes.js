import { Router } from "express";
import {
  getDocs,
  getDoc,
  newDoc,
  editDoc,
  toggleArchiveDoc,
} from "../controllers/docsController.js";
// import { authMiddleware } from ...
// import { noCache } from ...

const router = Router();

router.get("/", getDocs); // Get all docs appropriate of users based on canViewAllDocs etc.
router.get("/:id", getDoc); // get single doc
router.post("/", newDoc);
router.patch("/:id", editDoc);
router.post("/:id/archive", toggleArchiveDoc(true));
router.post("/:id/restore", toggleArchiveDoc(false));

export default router;

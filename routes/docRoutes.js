import { Router } from "express";
import {
  getDocs,
  getDoc,
  newDoc,
  editDoc,
  toggleArchiveDoc,
} from "../controllers/docsController.js";
import { authMiddleware, attachUser } from "../middleware/authMiddleware.js";
// import { noCache } from ...

const router = Router();

// All prefixed /api/docs
router.get("/", authMiddleware, attachUser, getDocs); // Get all docs appropriate of users based on canViewAllDocs etc.
router.get("/:id", authMiddleware, attachUser, getDoc); // get single doc
router.post("/", authMiddleware, attachUser, newDoc);
router.patch("/:id", authMiddleware, attachUser, editDoc);
router.post("/:id/archive", authMiddleware, attachUser, toggleArchiveDoc(true));
router.post(
  "/:id/restore",
  authMiddleware,
  attachUser,
  toggleArchiveDoc(false)
);

export default router;

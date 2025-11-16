import { Router } from "express";
import {
  getDocs,
  getDoc,
  newDoc,
  editDoc,
  toggleArchiveDoc,
} from "../controllers/docsController.js";
import {
  editDocsCategory,
  getDocsCategories,
  newDocsCategory,
} from "../controllers/docsController.js";
import { authMiddleware, attachUser } from "../middleware/authMiddleware.js";
// import { noCache } from ...

const router = Router();

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

// Doc categories
router.get("/categories", authMiddleware, attachUser, getDocsCategories);
router.post("/categories", authMiddleware, attachUser, newDocsCategory);
router.patch("/categories/:id", authMiddleware, attachUser, editDocsCategory);

export default router;

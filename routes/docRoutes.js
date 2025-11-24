import { Router } from "express";
import { upload } from "../utils/multer.js"; // memory storage
import {
  getDocs,
  getDoc,
  newDoc,
  editDoc,
  getDocsTree,
  uploadImage,
  signUrl,
  getDocsSearch,
} from "../controllers/docsController.js";
import {
  authMiddleware,
  attachUser,
  requirePermission,
} from "../middleware/authMiddleware.js";
// import { noCache } from ...

const router = Router();

// All prefixed /api/docs
router.get("/", authMiddleware, attachUser, getDocs); // Get all docs appropriate of users based on canViewAllDocs etc.
router.get("/tree", authMiddleware, attachUser, getDocsTree); // To output the explorer
router.get("/search", authMiddleware, attachUser, getDocsSearch);
router.get("/:id/sign-url", signUrl);
router.get("/:id", authMiddleware, attachUser, getDoc); // get single doc

router.post(
  "/:id/upload-image",
  authMiddleware,
  attachUser,
  upload.single("image"),
  uploadImage
);
router.post(
  "/",
  authMiddleware,
  attachUser,
  requirePermission("docs.CanCreateOwnDepartment"),
  newDoc
);
////////////////////////////// MUST UPDATE!
router.patch(
  "/edit/:id",
  authMiddleware,
  attachUser,
  requirePermission("docs.CanCreateOwnDepartment"),
  editDoc
);

export default router;

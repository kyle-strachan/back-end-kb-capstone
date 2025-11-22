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
  // listDocImages,
} from "../controllers/docsController.js";
import { authMiddleware, attachUser } from "../middleware/authMiddleware.js";
// import { noCache } from ...

const router = Router();

// All prefixed /api/docs
router.get("/", authMiddleware, attachUser, getDocs); // Get all docs appropriate of users based on canViewAllDocs etc.
router.get("/tree", authMiddleware, attachUser, getDocsTree); // To output the explorer
// router.get("/:id/images", listDocImages);
router.get("/:id", authMiddleware, attachUser, getDoc); // get single doc
router.get("/docs/:id/sign-url", signUrl);

router.post(
  "/:id/upload-image",
  authMiddleware,
  attachUser,
  upload.single("image"),
  uploadImage
);
router.post("/", authMiddleware, attachUser, newDoc);
router.patch("/edit/:id", authMiddleware, attachUser, editDoc);

export default router;

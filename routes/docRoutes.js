import { Router } from "express";
import { upload } from "../utils/multer.js"; // memory storage
import {
  getDocs,
  getDoc,
  newDoc,
  editDoc,
  uploadImage,
  signUrl,
  getDocsSearch,
} from "../controllers/docsController.js";
import { getDocsTree } from "../controllers/docsTreeController.js";
import {
  authMiddleware,
  attachUser,
  requirePermission,
} from "../middleware/authMiddleware.js";

const router = Router();

// Router controls all document routes
// Prefix: /api/docs

router.get(
  "/",
  authMiddleware,
  attachUser,
  requirePermission("docs.CanView"),
  getDocs
); // Gets list of all department documents that user is member of

router.get(
  "/tree",
  authMiddleware,
  attachUser,
  requirePermission("docs.CanView"),
  getDocsTree
); // Outputs the document tree explorer

router.get(
  "/search",
  authMiddleware,
  attachUser,
  requirePermission("docs.CanView"),
  getDocsSearch
); // Return document results from search

router.get(
  "/:id/sign-url",
  authMiddleware,
  attachUser,
  requirePermission("docs.CanView"),
  signUrl
); // Gets pre-signed URL from storage if document renders an image

router.get(
  "/:id",
  authMiddleware,
  attachUser,
  requirePermission("docs.CanView"),
  getDoc
); // Gets a single document

router.post(
  "/:id/upload-image",
  authMiddleware,
  attachUser,
  requirePermission("docs.CanEdit"),
  upload.single("image"),
  uploadImage
); // Uploads an image to the storage account

router.post(
  "/",
  authMiddleware,
  attachUser,
  requirePermission("docs.CanEdit"),
  newDoc
); // Create a new document

router.patch(
  "/edit/:id",
  authMiddleware,
  attachUser,
  requirePermission("docs.CanEdit"),
  editDoc
); // Edits an existing document

export default router;

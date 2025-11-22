import { Router } from "express";
import {
  getAccessAssignments,
  getAccessRequests,
  newAccessRequest,
  approveOrRejectRequest,
  revokeAccessRequest,
  getToActionAccessRequests,
  getMyAccessRequests,
  getByAccessRequests,
} from "../controllers/uacController.js";
import { authMiddleware, attachUser } from "../middleware/authMiddleware.js";
// import { noCache } from ...

const router = Router();

// Assignments
router.get(
  "/access-assignments",
  authMiddleware,
  attachUser,
  getAccessAssignments
);
router.post(
  "/access-assignments/revoke",
  authMiddleware,
  attachUser,
  revokeAccessRequest
);

// Requests
router.get("/access-requests", authMiddleware, attachUser, getAccessRequests);
router.get(
  "/access-requests/to-action",
  authMiddleware,
  attachUser,
  getToActionAccessRequests
);
router.get(
  "/access-requests/my-requests",
  authMiddleware,
  attachUser,
  getMyAccessRequests
);
router.get(
  "/access-requests/by-requests",
  authMiddleware,
  attachUser,
  getByAccessRequests
);
router.post("/access-requests", authMiddleware, attachUser, newAccessRequest);
router.patch(
  "/access-requests/:id",
  authMiddleware,
  attachUser,
  approveOrRejectRequest
);

export default router;

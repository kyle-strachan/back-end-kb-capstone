import { Router } from "express";
import {
  getAccessAssignments,
  getAccessRequests,
  newAccessRequest,
  approveOrRejectRequest,
  revokeAccess,
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
  "/access-assignments/revoke/:id",
  authMiddleware,
  attachUser,
  revokeAccess
);

// Requests
router.get("/access-requests", authMiddleware, attachUser, getAccessRequests);
router.post("/access-requests", authMiddleware, attachUser, newAccessRequest);
router.patch(
  "/access-requests/:id",
  authMiddleware,
  attachUser,
  approveOrRejectRequest
);

export default router;

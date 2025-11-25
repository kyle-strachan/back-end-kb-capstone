import { Router } from "express";
import {
  getAccessAssignments,
  getAccessRequests,
  newAccessRequest,
  approveOrRejectRequest,
  createRevokeAccessRequest,
  getToActionAccessRequests,
  confirmRevocation,
} from "../controllers/uacController.js";
import {
  authMiddleware,
  attachUser,
  requirePermission,
} from "../middleware/authMiddleware.js";

const router = Router();

// Router controls all ticket requests for access to systems, and action those requests.
// Prefix: /api/uac

router.get(
  "/access-assignments",
  authMiddleware,
  attachUser,
  requirePermission("accessRequests.CanViewCreate"),
  getAccessAssignments
); // *Assignments* are not directly managed, instead they are controlled via access *requests* and share a permission

router.post(
  "/access-assignments/confirm-revoke/:id",
  authMiddleware,
  attachUser,
  confirmRevocation
); // Actions the request to remove a user from a system. Actioning user must be admin of system, not route permission controlled.

router.post(
  "/access-requests/revoke",
  authMiddleware,
  attachUser,
  requirePermission("accessRequests.CanViewCreate"),
  createRevokeAccessRequest
); // Creates a ticket to revoke access.

router.get(
  "/access-requests",
  authMiddleware,
  attachUser,
  requirePermission("accessRequests.CanViewCreate"),
  getAccessRequests
); // Display all pending access requests

router.get(
  "/access-requests/to-action",
  authMiddleware,
  attachUser,
  requirePermission("accessRequests.CanViewCreate"),
  getToActionAccessRequests
); // Display list of request that user can action - TO DO: can I use a filter on access-requests to remove similar action?

router.post(
  "/access-requests",
  authMiddleware,
  attachUser,
  requirePermission("accessRequests.CanViewCreate"),
  newAccessRequest
); // Create a new access/revoke request ticket

router.patch(
  "/access-requests/:id",
  authMiddleware,
  attachUser,
  approveOrRejectRequest
); // Approve or deny request ticket. User must be admin of specific system. Route permission not enforced.

export default router;

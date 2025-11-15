import { Router } from "express";
import {
  getActiveAccessAssignments,
  getAccessRequests,
  newAccessRequest,
  updateAccessRequest,
} from "../controllers/uacController.js";
import { authMiddleware, attachUser } from "../middleware/authMiddleware.js";
// import { noCache } from ...

const router = Router();

// Current assignments
router.get(
  "/access-assignments",
  authMiddleware,
  attachUser,
  getActiveAccessAssignments
);

// Requests
router.get("/access-requests", authMiddleware, attachUser, getAccessRequests);
router.post("/access-requests", authMiddleware, attachUser, newAccessRequest);
router.patch(
  "/access-requests/:id",
  authMiddleware,
  attachUser,
  updateAccessRequest
);

export default router;

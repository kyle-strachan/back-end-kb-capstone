import { Router } from "express";
import {
  getAccessAssignments,
  getAccessRequests,
  newAccessRequest,
  updateAccessRequest,
} from "../controllers/userAccessControlMonitorController.js";

// import { authMiddleware } from ...
// import { noCache } from ...

const router = Router();

// Current assignments
router.get("/access-assignments", getAccessAssignments);

// Requests
router.get("/access-requests", getAccessRequests);
router.post("/access-requests", newAccessRequest);
router.patch("/access-requests/:id", updateAccessRequest);

export default router;

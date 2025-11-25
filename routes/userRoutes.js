import { Router } from "express";
import {
  registerUser,
  getUsers,
  editUser,
  terminateUser,
} from "../controllers/userController.js";
import {
  authMiddleware,
  attachUser,
  requirePermission,
} from "../middleware/authMiddleware.js";

const router = Router();

// Router controls all user profile access
// Prefix: /api/users

router.get(
  "/",
  authMiddleware,
  attachUser,
  requirePermission("users.CanView"),
  getUsers
); // View users
router.post(
  "/",
  authMiddleware,
  attachUser,
  requirePermission("users.CanRegister"),
  registerUser
); // Create new user
router.put(
  "/:id",
  authMiddleware,
  attachUser,
  requirePermission("users.CanEdit"),
  editUser
); // Edit existing user
router.patch(
  "/:id",
  authMiddleware,
  attachUser,
  requirePermission("users.CanTerminate"),
  terminateUser
); // Special edit/terminate user

export default router;

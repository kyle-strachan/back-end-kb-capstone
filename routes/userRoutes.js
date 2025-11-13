import { Router } from "express";
import {
  registerUser,
  getUsers,
  editUser,
} from "../controllers/userController.js";
import { authMiddleware, attachUser } from "../middleware/authMiddleware.js";
// import { noCache } from ...

const router = Router();

// Create new user
router.post("/", authMiddleware, attachUser, registerUser);
router.get("/", authMiddleware, attachUser, getUsers);
router.put("/:id", authMiddleware, attachUser, editUser);

export default router;

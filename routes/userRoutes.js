import { Router } from "express";
import {
  registerUser,
  getUsers,
  editUser,
  terminateUser,
} from "../controllers/userController.js";
import { authMiddleware, attachUser } from "../middleware/authMiddleware.js";
// import { noCache } from ...

const router = Router();

// Users
router.post("/", authMiddleware, attachUser, registerUser);
router.get("/", authMiddleware, attachUser, getUsers);
router.put("/:id", authMiddleware, attachUser, editUser);
router.patch("/:id", authMiddleware, attachUser, terminateUser);

export default router;

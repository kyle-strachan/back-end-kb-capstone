import { Router } from "express";
import {
  registerUser,
  getUsers,
  editUser,
} from "../controllers/userController.js";
// import { authMiddleware } from ...
// import { noCache } from ...

const router = Router();

// Create new user
router.post("/", registerUser);
router.get("/", getUsers);
router.put("/:id", editUser);

export default router;

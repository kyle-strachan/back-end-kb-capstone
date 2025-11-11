import { Router } from "express";
import { login, logout, resetPassword } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
// import { noCache } from ...

const router = Router();

// Login
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/reset", authMiddleware, resetPassword);

export default router;

import { Router } from "express";
import { login, logout, resetPassword } from "../controllers/authController.js";
import { authMiddleware, attachUser } from "../middleware/authMiddleware.js";

const router = Router();

// Router controls all authentication
// Prefix: /api/auth

router.post("/login", login); // Public route
router.post("/logout", authMiddleware, logout);
router.post("/reset", authMiddleware, resetPassword);
router.get("/me", authMiddleware, attachUser, (req, res) => {
  res.json({ user: req.user });
});

export default router;

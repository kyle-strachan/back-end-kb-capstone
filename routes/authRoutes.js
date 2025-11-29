import { Router } from "express";
import {
  login,
  logout,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";
import { authMiddleware, attachUser } from "../middleware/authMiddleware.js";
import { cleanUser } from "../utils/cleanUser.js";

const router = Router();

// Router controls all authentication
// Prefix: /api/auth

router.post("/login", login); // Public route
router.post("/logout", authMiddleware, logout);
router.post("/reset", authMiddleware, attachUser, resetPassword); // Reset by an admin
router.patch("/change-password", authMiddleware, attachUser, changePassword); // Changed by user
router.get("/me", authMiddleware, attachUser, (req, res) => {
  res.json({ user: cleanUser(req.user) });
});

export default router;

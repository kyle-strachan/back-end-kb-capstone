import { Router } from "express";
import { login, logout, resetPassword } from "../controllers/authController.js";
import { authMiddleware, attachUser } from "../middleware/authMiddleware.js";
// import { noCache } from ...

const router = Router();

// Login
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/reset", authMiddleware, resetPassword);
router.get("/me", authMiddleware, attachUser, (req, res) => {
  res.json(req.user);
});

export default router;

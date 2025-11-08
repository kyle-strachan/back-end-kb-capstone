import { Router } from "express";
import { login, logout } from "../controllers/authController.js";
// import { authMiddleware } from ...
// import { noCache } from ...

const router = Router();

// Login
router.post("/login", login);
router.post("/logout", logout);

export default router;

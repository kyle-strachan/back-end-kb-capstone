import { Router } from "express";
import { register, getUsers } from "../controllers/userController.js";
// import { authMiddleware } from ...
// import { noCache } from ...

const router = Router();

// Create new user
router.post("/", register);
router.get("/", getUsers);

export default router;

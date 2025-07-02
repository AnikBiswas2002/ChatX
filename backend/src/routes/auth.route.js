import express from "express";
import multer from "multer";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Setup multer for memory storage (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update", protectRoute, upload.single("profilePicture"), updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;

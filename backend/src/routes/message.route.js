import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getMessages,
  getUsersForSidebar,
  sendMessage
} from '../controllers/message.controller.js';

const router = express.Router();

// Get list of users for sidebar
router.get("/users", protectRoute, getUsersForSidebar);

// Get messages with a specific user
router.get("/:id", protectRoute, getMessages);

// Send message to a specific user
router.post("/send/:id", protectRoute, sendMessage);

export default router;

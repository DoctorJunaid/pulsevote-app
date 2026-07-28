// ==================== NOTIFICATION ROUTES (notificationRoutes.js) ====================
import express from "express";
import {
  getNotifications,
  markRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const notificationRouter = express.Router();

// All notification routes require authentication
notificationRouter.use(protect);

// Get unread notifications and list
notificationRouter.get("/", getNotifications);

// Mark all notifications as read
notificationRouter.patch("/read", markRead);

export default notificationRouter;
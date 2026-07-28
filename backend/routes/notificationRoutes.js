// ==================== NOTIFICATION ROUTES (notificationRoutes.js) ====================
// Defines REST API endpoints for fetching user activity alerts and marking notifications as read.

import express from "express";
import {
  getNotifications,
  markRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const notificationRouter = express.Router();

// Enforce JWT authentication across all notification endpoints
notificationRouter.use(protect);

/**
 * @route   GET /api/v1/notifications
 * @desc    Retrieves recent activity notifications and unread alert count
 */
notificationRouter.get("/", getNotifications);

/**
 * @route   PATCH /api/v1/notifications/read
 * @desc    Marks all notifications for the authenticated user as read
 */
notificationRouter.patch("/read", markRead);

export default notificationRouter;
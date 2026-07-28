// ==================== USER PROFILE & CONNECTIONS ROUTES (userRoutes.js) ====================
// Defines REST API endpoints for user public profile viewing, social connection lists,
// and following/unfollowing users. All endpoints are protected by JWT authentication.

import express from "express";
import {
  getConnections,
  getPublicProfile,
  toggleFollow,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

// Enforce JWT authentication across all user routes
userRouter.use(protect);

/**
 * @route   GET /api/v1/user/:username/connections
 * @desc    Retrieves follower and following lists for the specified user
 * @access  Private (Authenticated users)
 */
userRouter.get("/:username/connections", getConnections);

/**
 * @route   GET /api/v1/user/:username
 * @desc    Retrieves public user profile details, created polls, and social stats
 * @access  Private (Authenticated users)
 */
userRouter.get("/:username", getPublicProfile);

/**
 * @route   POST /api/v1/user/:username/follow
 * @desc    Toggles follow/unfollow status for the specified target user
 * @access  Private (Authenticated users)
 */
userRouter.post("/:username/follow", toggleFollow);

export default userRouter;
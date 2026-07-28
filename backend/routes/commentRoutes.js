// ==================== COMMENT DISCUSSION ROUTES (commentRoutes.js) ====================
// Defines REST API endpoints for loading discussion threads, creating main/reply comments,
// and deleting user comments. All routes require JWT authentication.

import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/auth.js";

const commentRouter = express.Router();

// Enforce JWT authentication across all comment endpoints
commentRouter.use(protect);

/**
 * @route   GET /api/v1/comment/:id
 * @desc    Retrieves all discussion comments for a single poll by ID
 */
commentRouter.get("/:id", getComments);

/**
 * @route   POST /api/v1/comment/:id
 * @desc    Creates a new comment or nested reply for a poll
 */
commentRouter.post("/:id", addComment);

/**
 * @route   DELETE /api/v1/comment/:id
 * @desc    Deletes a comment and its child replies (Author only)
 */
commentRouter.delete("/:id", deleteComment);

export default commentRouter;
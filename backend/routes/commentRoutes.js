// ==================== COMMENT ROUTES (commentRoutes.js) ====================
import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/auth.js";

const commentRouter = express.Router();

// All comment routes require authentication
commentRouter.use(protect);

// Get comments for a poll
commentRouter.get("/:id", getComments);

// Add a comment or reply to a poll
commentRouter.post("/:id", addComment);

// Delete a comment
commentRouter.delete("/:id", deleteComment);

export default commentRouter;
// ==================== POLL API ROUTES (pollRoutes.js) ====================
// Defines REST API endpoints for poll creation, feed discovery, voting, bookmarking,
// poll closing, analytics retrieval, and owner management.

import express from "express";
import {
  createPoll,
  listPolls,
  getMyPolls,
  getVotedPolls,
  getMyBookmarks,
  getTrending,
  getPoll,
  getPollAnalytics,
  recordView,
} from "../controllers/pollController.js";
import {
  votePoll,
  removeVote,
  updatePoll,
  toggleBookmark,
  closePoll,
  deletePoll,
} from "../controllers/voteController.js";
import { protect } from "../middleware/auth.js";
import { uploadInstance } from "../config/cloudinary.js";

const pollRouter = express.Router();

// Enforce JWT authentication across all poll endpoints
pollRouter.use(protect);

/**
 * @route   GET /api/v1/poll
 * @desc    Fetches list of polls with optional filtering (type, category, feed)
 */
pollRouter.get("/", listPolls);

/**
 * @route   POST /api/v1/poll
 * @desc    Creates a new poll (supports up to 4 image uploads via multer memory storage)
 */
pollRouter.post("/", uploadInstance.array("images", 4), createPoll);

/**
 * @route   GET /api/v1/poll/mine
 * @desc    Retrieves polls created by the authenticated user
 */
pollRouter.get("/mine", getMyPolls);

/**
 * @route   GET /api/v1/poll/voted
 * @desc    Retrieves polls where the user has cast a vote
 */
pollRouter.get("/voted", getVotedPolls);

/**
 * @route   GET /api/v1/poll/bookmarks
 * @desc    Retrieves polls bookmarked by the user
 */
pollRouter.get("/bookmarks", getMyBookmarks);

/**
 * @route   GET /api/v1/poll/trending
 * @desc    Retrieves poll counts aggregated by type for explore widgets
 */
pollRouter.get("/trending", getTrending);

/**
 * @route   GET /api/v1/poll/:id/analytics
 * @desc    Retrieves owner-only poll analytics and total discussion comment count
 */
pollRouter.get("/:id/analytics", getPollAnalytics);

/**
 * @route   GET /api/v1/poll/:id
 * @desc    Retrieves single poll details and increments view count
 */
pollRouter.get("/:id", getPoll);

/**
 * @route   POST /api/v1/poll/:id/view
 * @desc    Records a view on the specified poll
 */
pollRouter.post("/:id/view", recordView);

/**
 * @route   POST /api/v1/poll/:id/vote
 * @desc    Casts or updates a user vote on the specified poll
 */
pollRouter.post("/:id/vote", votePoll);

/**
 * @route   DELETE /api/v1/poll/:id/vote
 * @desc    Revokes a previously cast vote on the specified poll
 */
pollRouter.delete("/:id/vote", removeVote);

/**
 * @route   PATCH /api/v1/poll/:id/close
 * @desc    Toggles poll status between open and closed (Owner only)
 */
pollRouter.patch("/:id/close", closePoll);

/**
 * @route   PATCH /api/v1/poll/:id
 * @desc    Updates poll question title or category (Owner only)
 */
pollRouter.patch("/:id", updatePoll);

/**
 * @route   DELETE /api/v1/poll/:id
 * @desc    Deletes poll and all associated comments (Owner only)
 */
pollRouter.delete("/:id", deletePoll);

/**
 * @route   POST /api/v1/poll/:id/bookmark
 * @desc    Toggles bookmark status for the specified poll
 */
pollRouter.post("/:id/bookmark", toggleBookmark);

export default pollRouter;
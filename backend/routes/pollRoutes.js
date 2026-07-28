// ==================== POLL ROUTES (pollRoutes.js) ====================
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
import { upload } from "../config/cloudinary.js";

const pollRouter = express.Router();

// All poll routes require authentication
pollRouter.use(protect);

// Poll listing and creation routes
pollRouter.get("/", listPolls);
pollRouter.post("/", upload.array("images", 4), createPoll);
pollRouter.get("/mine", getMyPolls);
pollRouter.get("/voted", getVotedPolls);
pollRouter.get("/bookmarks", getMyBookmarks);
pollRouter.get("/trending", getTrending);

// Single poll analytics and retrieval routes
pollRouter.get("/:id/analytics", getPollAnalytics);
pollRouter.get("/:id", getPoll);

// Poll interaction and management routes
pollRouter.post("/:id/vote", votePoll);
pollRouter.delete("/:id/vote", removeVote);
pollRouter.patch("/:id/close", closePoll);
pollRouter.patch("/:id", updatePoll);
pollRouter.delete("/:id", deletePoll);
pollRouter.post("/:id/bookmark", toggleBookmark);

export default pollRouter;
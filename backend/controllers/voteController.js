// ==================== VOTE CONTROLLER ====================
import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import { notify } from "./notificationController.js";

// 1. Vote on a poll
export const votePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.closed) {
      return res.status(400).json({ message: "This poll is closed" });
    }

    const { value } = req.body;
    if (value === undefined || value === null || value === "") {
      return res.status(400).json({ message: "Vote value is required" });
    }

    // Check if user already voted and filter out old vote
    const hasVoted = poll.votes.some(
      (v) => v.user.toString() === req.userId.toString()
    );

    poll.votes = poll.votes.filter(
      (v) => v.user.toString() !== req.userId.toString()
    );

    poll.votes.push({ user: req.userId, value });
    await poll.save();

    if (!hasVoted) {
      await notify(poll.creator, req.userId, poll._id, "vote");
    }

    res.json({ message: "Vote recorded" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Remove a vote
export const removeVote = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.closed) {
      return res.status(400).json({ message: "This poll is closed" });
    }

    poll.votes = poll.votes.filter(
      (v) => v.user.toString() !== req.userId.toString()
    );
    await poll.save();

    res.json({ message: "Vote removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Helper function to check if the user is the owner of the poll
const ownerGuard = (poll, userId) => {
  return poll.creator.toString() === userId.toString();
};

// 3. Update a poll (question and category)
export const updatePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (!ownerGuard(poll, req.userId)) return res.status(403).json({ message: "Not your poll" });

    const { question, category } = req.body;
    if (question !== undefined && question.trim()) poll.question = question.trim();
    if (category !== undefined) poll.category = category;

    await poll.save();
    res.json({ message: "Poll updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Toggle Bookmark
export const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const id = req.params.id;
    const has = user.bookmarks.some((b) => String(b) === String(id));
    user.bookmarks = has
      ? user.bookmarks.filter((b) => String(b) !== String(id))
      : [...user.bookmarks, id];
    await user.save();
    res.json({ bookmarked: !has });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. Close or Reopen Poll
export const closePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (!ownerGuard(poll, req.userId)) return res.status(403).json({ message: "Not your poll" });

    poll.closed = !poll.closed;
    await poll.save();
    res.json({ closed: poll.closed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. Delete Poll and its Comments
export const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (!ownerGuard(poll, req.userId)) return res.status(403).json({ message: "Not your poll" });

    await Comment.deleteMany({ poll: poll._id });
    await poll.deleteOne();

    res.json({ message: "Poll deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
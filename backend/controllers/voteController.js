// ==================== VOTE & POLL MANAGEMENT CONTROLLER ====================
// Handles voting actions (voting, revoking votes), bookmark toggling,
// poll modifications, closing/reopening polls, and poll deletion by owners.

import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import { notify } from "./notificationController.js";

/**
 * HELPER: Security guard function to verify if the requesting user owns the poll.
 * Why: Prevents unauthorized users from editing, closing, or deleting polls owned by others.
 */
const ownerGuard = (poll, userId) => {
  return poll.creator.toString() === userId.toString();
};

/**
 * 1. CAST OR SWITCH VOTE ON A POLL
 * Logic:
 * - Checks if the target poll exists and is open for voting.
 * - Filters out any existing vote cast by this user to allow seamless vote switching.
 * - Pushes the new vote object containing `{ user: req.userId, value }` to the poll's votes array.
 * - Dispatches a real-time notification to the poll creator if this is the user's first vote on this poll.
 */
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

/**
 * 2. REMOVE / REVOKE VOTE
 * Logic:
 * - Verifies the poll is active and open.
 * - Removes the user's vote entry from the votes array and saves the poll.
 */
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

/**
 * 3. UPDATE POLL DETAILS (OWNER ONLY)
 * Logic:
 * - Verifies poll exists and caller is poll creator via `ownerGuard`.
 * - Updates question title and/or category.
 */
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

/**
 * 4. TOGGLE BOOKMARK / SAVE POLL
 * Logic:
 * - Adds poll ID to user's `bookmarks` array if not bookmarked, or removes it if already present.
 */
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

/**
 * 5. CLOSE OR REOPEN POLL (OWNER ONLY)
 * Logic:
 * - Toggles `closed` boolean property. When closed, new votes cannot be recorded.
 */
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

/**
 * 6. DELETE POLL (OWNER ONLY)
 * Logic:
 * - Verifies caller ownership via `ownerGuard`.
 * - Cleans up all comments associated with this poll before deleting poll document.
 */
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
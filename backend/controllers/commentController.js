// ==================== COMMENT CONTROLLER (commentController.js) ====================
// Manages poll discussions: retrieving comment threads, creating main comments or nested replies,
// triggering creator notifications, and handling authorized comment deletion.

import Comment from "../models/Comment.js";
import Poll from "../models/Poll.js";
import { notify } from "./notificationController.js";

/**
 * 1. GET ALL COMMENTS FOR A SINGLE POLL
 * Logic:
 * - Queries comments filtered by poll ID (`poll: req.params.id`).
 * - Populates author profile details (name, username, avatar).
 * - Sorts threads in descending order (newest comments first).
 */
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ poll: req.params.id })
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 2. ADD A COMMENT OR NESTED REPLY
 * Logic:
 * - Validates that comment text is non-empty.
 * - Creates a Comment document; supports threaded replies by storing optional `parent` comment ID.
 * - Populates the author details for immediate front-end store update.
 * - Triggers an in-app notification to the poll creator (if the comment author is not the creator).
 */
export const addComment = async (req, res) => {
  try {
    const text = req.body.text?.trim();
    if (!text) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const comment = await Comment.create({
      poll: req.params.id,
      user: req.userId,
      parent: req.body.parent || null,
      text,
    });

    const populated = await comment.populate("user", "name username avatar");

    const poll = await Poll.findById(req.params.id).select("creator");
    if (poll) {
      await notify(poll.creator, req.userId, poll._id, "comment");
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 3. DELETE A COMMENT & ITS CHILD REPLIES
 * Logic:
 * - Finds target comment by ID and checks caller authorization (`comment.user === req.userId`).
 * - Deletes the target comment AND any child replies linked via `parent: comment._id` using `$or`.
 *   Why: Prevents orphaned reply comments in the database.
 */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Comment.deleteMany({
      $or: [{ _id: comment._id }, { parent: comment._id }],
    });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
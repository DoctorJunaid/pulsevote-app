// ==================== COMMENT CONTROLLER (commentController.js) ====================
import Comment from "../models/Comment.js";
import Poll from "../models/Poll.js";
import { notify } from "./notificationController.js";

// 1. Get all comments for a single poll
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

// 2. Add a comment or a reply to a poll
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

// 3. Delete a comment and its replies
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
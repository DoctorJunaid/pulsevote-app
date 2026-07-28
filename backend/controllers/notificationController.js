// ==================== NOTIFICATION CONTROLLER (notificationController.js) ====================
// Manages real-time user notification events (vote, comment, follow alerts),
// unread count calculations, and batch marking notifications as read.

import Notification from "../models/Notification.js";

/**
 * HELPER: Internal utility to generate activity notifications.
 * Why: Ignores self-notifications (when user acts on their own poll) and silently handles errors
 * to ensure notification dispatches never break main request flows (e.g. voting or commenting).
 */
export const notify = async (user, actor, poll, type) => {
  if (!user || user.toString() === actor.toString()) return;
  try {
    await Notification.create({ user, actor, poll, type });
  } catch (err) {
    // Ignore notification errors to prevent blocking main user request operations
  }
};

/**
 * 1. GET USER NOTIFICATIONS & UNREAD COUNT
 * Logic:
 * - Fetches the latest 20 notifications for the logged-in user, populating actor profile and poll question.
 * - Counts unread notifications (`read: false`) to update top-nav counter badges.
 */
export const getNotifications = async (req, res) => {
  try {
    const items = await Notification.find({ user: req.userId })
      .populate("actor", "name username avatar")
      .populate("poll", "question")
      .sort({ createdAt: -1 })
      .limit(20);

    const unread = await Notification.countDocuments({
      user: req.userId,
      read: false,
    });

    res.json({ items, unread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 2. MARK ALL NOTIFICATIONS AS READ
 * Logic: Batch updates all unread notifications for currently logged-in user (`read: false` -> `read: true`).
 */
export const markRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, read: false },
      { read: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
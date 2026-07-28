
// 2. Notification Controller Functions (notificationController.js)
import Notification from "../models/Notification.js";

// Helper function to create notifications
export const notify = async (user, actor, poll, type) => {
  if (!user || user.toString() === actor.toString()) return;
  try {
    await Notification.create({ user, actor, poll, type });
  } catch (err) {
    // Ignore notification errors to prevent blocking main requests
  }
};

// Get unread notifications and list
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

// Mark notifications as read
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
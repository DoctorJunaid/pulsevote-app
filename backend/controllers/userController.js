// ==================== USER PROFILE & CONNECTIONS CONTROLLER ====================
// Manages public profile views, dynamic user statistics (polls created, total votes cast,
// follower/following counts), user relationship management (follow/unfollow), and connection lists.

import User from "../models/User.js";
import Poll from "../models/Poll.js";
import { shapePoll, bookmarkSet } from "./pollController.js";
import { withCounts } from "../utils/counts.js";

/**
 * 1. GET PUBLIC PROFILE & USER CREATED POLLS
 * Logic:
 * - Queries target user document by `:username` (fetching public fields: name, username, avatar, bio, following).
 * - Executes parallel queries (`Promise.all`) for high performance:
 *   a) Polls created by target user sorted by latest first.
 *   b) Count of polls voted on by target user.
 *   c) Count of followers (users who have target user's ID in their `following` array).
 *   d) Requesting user's bookmarks & following array to compute `isFollowing` state.
 * - Formats created polls with vote percentages and comment/save counts.
 * - Returns user details, relation flags (`isFollowing`, `isMe`), and profile statistics.
 */
export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "name username avatar bio following"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [polls, voted, followers, me] = await Promise.all([
      Poll.find({ creator: user._id })
        .populate("creator", "name username avatar")
        .sort("-createdAt"),
      Poll.countDocuments({ "votes.user": user._id }),
      User.countDocuments({ following: user._id }),
      User.findById(req.userId).select("bookmarks following"),
    ]);

    const isFollowing = (me?.following || []).some(
      (id) => String(id) === String(user._id),
    );

    const set = await bookmarkSet(req.userId);
    const shaped = await withCounts(
      polls.map((p) => shapePoll(p, req.userId, set)),
    );

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
      },
      isFollowing,
      isMe: String(user._id) === String(req.userId),
      stats: {
        created: polls.length,
        voted,
        followers,
        following: user.following.length,
      },
      polls: shaped
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 2. TOGGLE FOLLOW / UNFOLLOW USER
 * Logic:
 * - Finds target user by `:username`.
 * - Prevents self-following (`target._id === req.userId`).
 * - Toggles target user's ID in requesting user's `following` array (pushes if new, pulls if existing).
 * - Recalculates updated followers count for target user and returns updated state.
 */
export const toggleFollow = async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username }).select("_id");
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (target._id.toString() === req.userId.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const me = await User.findById(req.userId).select("following");
    const alreadyFollowing = me.following.includes(target._id);

    if (alreadyFollowing) {
      me.following.pull(target._id);
    } else {
      me.following.push(target._id);
    }

    await me.save();

    const followersCount = await User.countDocuments({ following: target._id });

    res.json({
      following: !alreadyFollowing,
      followers: followersCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 3. GET USER CONNECTIONS (FOLLOWERS & FOLLOWING LISTS)
 * Logic:
 * - Fetches target user and populates their `following` user profiles.
 * - Queries database for all users who follow target user (`{ following: targetUser._id }`).
 * - Returns structured list of followers and following for social UI modals.
 */
export const getConnections = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("_id following")
      .populate("following", "name username avatar");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followers = await User.find({ following: user._id }).select(
      "name username avatar"
    );

    res.json({
      followers,
      following: user.following,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
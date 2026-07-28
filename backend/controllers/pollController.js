import Poll from "../models/Poll.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { withCounts } from "../utils/counts.js";

// Populate configuration for fetching poll creator profile details
const POP = [{ path: "creator", select: "name username avatar" }];

// Generates a Set of bookmarked poll IDs for a user to allow quick O(1) checks
export const bookmarkSet = async (userId) => {
  if (!userId) return new Set();
  const user = await User.findById(userId).select("bookmarks");
  return new Set(user?.bookmarks?.map((id) => id.toString()) || []);
};

// Transforms raw database poll data into a clean structure including vote counts, percentages, and user-specific status (voted, bookmarked)
export const shapePoll = (poll, userId, bookmarkSet = new Set()) => {
  const isBookmarked = bookmarkSet?.has ? bookmarkSet.has(poll._id.toString()) : false;
  const totalVotes = poll.votes?.length || 0;

  let userVoted = false;
  let votedOption = null;
  if (userId) {
    const vote = poll.votes?.find((v) => v.user.toString() === userId.toString());
    if (vote) {
      userVoted = true;
      votedOption = vote.value;
    }
  }

  const options = poll.options.map((opt, idx) => {
    const count = poll.votes?.filter((v) => String(v.value) === String(idx) || String(v.value) === String(opt._id) || v.value === opt.text).length || 0;
    return {
      _id: opt._id,
      text: opt.text,
      image: opt.image,
      votesCount: count,
      percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
    };
  });

  return {
    _id: poll._id,
    creator: poll.creator,
    question: poll.question,
    type: poll.type,
    options,
    category: poll.category,
    closed: poll.closed,
    views: poll.views,
    createdAt: poll.createdAt,
    updatedAt: poll.updatedAt,
    totalVotes,
    userVoted,
    votedOption,
    isBookmarked,
  };
};

// Shared helper function to query, sort, shape, and send a list of polls
const sendList = async (filter, req, res) => {
  try {
    const polls = await Poll.find(filter).populate(...POP).sort("-createdAt");
    const set = await bookmarkSet(req.userId);
    const shaped = await withCounts(polls.map((p) => shapePoll(p, req.userId, set)));
    res.json(shaped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Creates a new poll (supports yes/no, multiple-choice, and image options) and saves it to the database
export const createPoll = async (req, res) => {
  try {
    const { question, category, type } = req.body;
    if (!question || !type)
      return res.status(400).json({ message: "Question and type are required" });

    let options = [];
    if (type === "yesno") {
      options = [{ text: "Yes" }, { text: "No" }];
    } else if (type === "single") {
      const parsed = JSON.parse(req.body.options || "[]");
      options = parsed
        .filter((t) => t && t.trim())
        .map((t) => ({ text: t.trim() }));
      if (options.length < 2)
        return res.status(400).json({ message: "Add at least 2 options" });
    } else if (type === "image") {
      if (!req.files || req.files.length < 2)
        return res.status(400).json({ message: "Add at least 2 images" });
      const urls = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.buffer)),
      );
      options = urls.map((image) => ({ image, text: "" }));
    }

    const poll = new Poll({
      creator: req.userId,
      question,
      type,
      options,
      category: category || "General",
    });
    await poll.save();
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Retrieves a list of polls based on filters (type, category, feed type) and formats them for the response
export const getPolls = async (req, res) => {
  const filter = {};
  if (req.query.type && req.query.type !== "all")
    filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;

  if (req.query.feed === "following") {
    try {
      const me = await User.findById(req.userId).select("following");
      filter.creator = { $in: me?.following || [] };
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  await sendList(filter, req, res);
};

// Fetches a single poll by ID, increments its views (if not the creator), and returns it formatted
export const getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate(...POP);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    // Prevent view increment if request specifies ?noview=true OR if the user is the creator
    const creatorId = poll.creator?._id || poll.creator;
    const isCreator = String(creatorId) === String(req.userId);
    const skipView = req.query.noview === "true";

    if (!isCreator && !skipView) {
      poll.views = (poll.views || 0) + 1; // count this view
      await poll.save();
    }

    const set = await bookmarkSet(req.userId);
    const [shaped] = await withCounts([shapePoll(poll, req.userId, set)]);
    res.json(shaped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lists polls based on filters (alias for getPolls to ensure compatibility)
export const listPolls = async (req, res) => {
  await getPolls(req, res);
};

// Gets all polls created by the logged-in user
export const getMyPolls = async (req, res) => {
  try {
    await sendList({ creator: req.userId }, req, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Gets all polls that the logged-in user voted on
export const getVotedPolls = async (req, res) => {
  try {
    await sendList({ "votes.user": req.userId }, req, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Gets all polls bookmarked/saved by the logged-in user
export const getMyBookmarks = async (req, res) => {
  try {
    const me = await User.findById(req.userId).populate({
      path: "bookmarks",
      populate: { path: "creator", select: "name username avatar" },
    });
    const set = new Set((me?.bookmarks || []).map((p) => String(p._id)));
    const shaped = (me?.bookmarks || []).map((p) => shapePoll(p, req.userId, set));
    res.json(await withCounts(shaped));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Returns total count of polls aggregated by poll type (single, yesno, rating, image, open)
export const getTrending = async (req, res) => {
  try {
    const types = ["single", "yesno", "rating", "image", "open"];
    const counts = await Promise.all(
      types.map((t) => Poll.countDocuments({ type: t }))
    );
    res.json(types.map((t, i) => ({
      type: t,
      count: counts[i]
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Returns detailed poll metadata along with the total count of comments for the owner
export const getPollAnalytics = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate(...POP);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const creatorId = poll.creator?._id || poll.creator;
    if (String(creatorId) !== String(req.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const set = await bookmarkSet(req.userId);
    const [shaped] = await withCounts([shapePoll(poll, req.userId, set)]);
    const commentCount = await Comment.countDocuments({ poll: poll._id });

    res.json({
      poll: shaped,
      comments: commentCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
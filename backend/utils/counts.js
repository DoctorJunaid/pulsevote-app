import Comment from "../models/Comment.js";
import User from "../models/User.js";

// Aggregates and retrieves counts of comments and bookmarks/saves for a given array of poll IDs
export const countsFor = async (pollIds) => {
  if (!pollIds.length) {
    return {
      commentMap: {},
      saveMap: {},
    };
  }

  const [comments, saves] = await Promise.all([
    Comment.aggregate([
      { $match: { poll: { $in: pollIds } } },
      { $group: { _id: "$poll", n: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $match: { bookmarks: { $in: pollIds } } },
      { $unwind: "$bookmarks" },
      { $match: { bookmarks: { $in: pollIds } } },
      { $group: { _id: "$bookmarks", n: { $sum: 1 } } },
    ]),
  ]);

  const commentMap = {};
  const saveMap = {};

  comments.forEach((c) => (commentMap[String(c._id)] = c.n));
  saves.forEach((s) => (saveMap[String(s._id)] = s.n));

  return { commentMap, saveMap };
};

// Maps comment and save counts onto shaped poll objects for frontend consumption
export async function withCounts(shapedPolls) {
  const { commentMap, saveMap } = await countsFor(
    shapedPolls.map((p) => p._id)
  );

  return shapedPolls.map((p) => ({
    ...p,
    comments: commentMap[String(p._id)] || 0,
    saves: saveMap[String(p._id)] || 0,
  }));
}
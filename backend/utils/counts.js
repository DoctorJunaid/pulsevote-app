// ==================== AGGREGATION & COUNTS UTILITY (counts.js) ====================
// Provides high-performance database aggregation for calculating comments and bookmarks/saves
// across multiple polls simultaneously without incurring N+1 query performance bottlenecks.

import Comment from "../models/Comment.js";
import User from "../models/User.js";

/**
 * 1. AGGREGATE COMMENTS AND BOOKMARK SAVES FOR POLL LISTS
 * Logic & Performance Rationale:
 * - Solves the N+1 database query problem by aggregating counts in bulk using MongoDB aggregation pipelines (`$match`, `$group`, `$unwind`).
 * - Executes comment counting and bookmark counting concurrently using `Promise.all`.
 * - Returns dictionary maps (`commentMap` and `saveMap`) for O(1) key-value lookup per poll ID.
 */
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

/**
 * 2. ENRICH SHAPED POLL OBJECTS WITH AGGREGATED COUNTS
 * Logic:
 * - Takes an array of shaped poll objects.
 * - Queries aggregated counts in batch.
 * - Maps the `comments` count and `saves` count onto each poll object for front-end store consumption.
 */
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
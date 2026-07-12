import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import UserBadge from '../models/UserBadge.js';

// @desc    Get leaderboard by XP
// @route   GET /api/leaderboard/xp
// @access  Private
const getLeaderboardByXP = asyncHandler(async (req, res) => {
  const { limit = 10, department } = req.query;

  // Build filter
  const filter = {};
  if (department) filter.department = department;

  const leaders = await User.find(filter)
    .select('name email department role xp_total points_balance')
    .sort({ xp_total: -1 })
    .limit(parseInt(limit));

  // Add rank
  const rankedLeaders = leaders.map((user, index) => ({
    rank: index + 1,
    _id: user._id,
    name: user.name,
    email: user.email,
    department: user.department,
    role: user.role,
    xp_total: user.xp_total,
    points_balance: user.points_balance
  }));

  res.json(rankedLeaders);
});

// @desc    Get leaderboard by points balance
// @route   GET /api/leaderboard/points
// @access  Private
const getLeaderboardByPoints = asyncHandler(async (req, res) => {
  const { limit = 10, department } = req.query;

  // Build filter
  const filter = {};
  if (department) filter.department = department;

  const leaders = await User.find(filter)
    .select('name email department role xp_total points_balance')
    .sort({ points_balance: -1 })
    .limit(parseInt(limit));

  // Add rank
  const rankedLeaders = leaders.map((user, index) => ({
    rank: index + 1,
    _id: user._id,
    name: user.name,
    email: user.email,
    department: user.department,
    role: user.role,
    xp_total: user.xp_total,
    points_balance: user.points_balance
  }));

  res.json(rankedLeaders);
});

// @desc    Get leaderboard by badge count
// @route   GET /api/leaderboard/badges
// @access  Private
const getLeaderboardByBadges = asyncHandler(async (req, res) => {
  const { limit = 10, department } = req.query;

  // For this leaderboard, we need to aggregate badge counts
  // We'll use the aggregation pipeline for efficiency

  const matchStage = {};
  if (department) matchDepartment = { department };

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'employeebadges',
        localField: '_id',
        foreignField: 'employee',
        as: 'badges'
      }
    },
    {
      $addFields: {
        badgeCount: { $size: '$badges' }
      }
    },
    { $sort: { badgeCount: -1 } },
    { $limit: parseInt(limit) },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        department: 1,
        role: 1,
        xp_total: 1,
        points_balance: 1,
        badgeCount: 1
      }
    }
  ];

  try {
    const leaders = await User.aggregate(pipeline);

    // Add rank
    const rankedLeaders = leaders.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      xp_total: user.xp_total,
      points_balance: user.points_balance,
      badgeCount: user.badgeCount
    }));

    res.json(rankedLeaders);
  } catch (error) {
    // Fallback to simpler method if aggregation fails
    const users = await User.find(
      department ? { department } : {}
    ).select('name email department role xp_total points_balance');

    // Get badge counts for each user (less efficient but works)
    const userBadgesPromises = users.map(user =>
      UserBadge.countDocuments({ employee: user._id })
    );
    const badgeCounts = await Promise.all(userBadgesPromises);

    // Combine data
    const usersWithBadges = users.map((user, index) => ({
      ...user.toObject(),
      badgeCount: badgeCounts[index]
    }));

    // Sort by badge count
    usersWithBadges.sort((a, b) => b.badgeCount - a.badgeCount);

    // Limit results
    const limitedUsers = usersWithBadges.slice(0, parseInt(limit));

    // Add rank
    const rankedLeaders = limitedUsers.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      xp_total: user.xp_total,
      points_balance: user.points_balance,
      badgeCount: user.badgeCount
    }));

    res.json(rankedLeaders);
  }
});

export {
  getLeaderboardByXP,
  getLeaderboardByPoints,
  getLeaderboardByBadges
};
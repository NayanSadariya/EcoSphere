import asyncHandler from 'express-async-handler';
import Badge from '../models/Badge.js';
import EmployeeBadge from '../models/EmployeeBadge.js';
import User from '../models/User.js';

// @desc    Get all badges
// @route   GET /api/badges
// @access  Private
const getBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.find({})
    .sort({ name: 1 });

  res.json(badges);
});

// @desc    Get a single badge
// @route   GET /api/badges/:id
// @access  Private
const getBadgeById = asyncHandler(async (req, res) => {
  const badge = await Badge.findById(req.params.id);

  if (badge) {
    res.json(badge);
  } else {
    res.status(404);
    throw new Error('Badge not found');
  }
});

// @desc    Create a new badge
// @route   POST /api/badges
// @access  Private/Admin
const createBadge = asyncHandler(async (req, res) => {
  const { name, description, unlock_rule, icon_url } = req.body;

  // Validate required fields
  if (!name || !description || !unlock_rule) {
    res.status(400);
    throw new Error('Please provide name, description, and unlock_rule');
  }

  // Validate unlock_rule structure
  if (typeof unlock_rule !== 'object' || !unlock_rule.type || !unlock_rule.value) {
    res.status(400);
    throw new Error('Unlock rule must be an object with type and value properties');
  }

  // Validate unlock_rule type
  const validTypes = ['xp_gte', 'challenges_completed_gte', 'points_balance_gte'];
  if (!validTypes.includes(unlock_rule.type)) {
    res.status(400);
    throw new Error('Unlock rule type must be one of: xp_gte, challenges_completed_gte, points_balance_gte');
  }

  // Validate unlock_rule value is a number
  if (typeof unlock_rule.value !== 'number' || unlock_rule.value < 0) {
    res.status(400);
    throw new Error('Unlock rule value must be a non-negative number');
  }

  // Check if badge with same name already exists
  const badgeExists = await Badge.findOne({ name });
  if (badgeExists) {
    res.status(400);
    throw new Error('Badge with this name already exists');
  }

  const badge = await Badge.create({
    name,
    description,
    unlock_rule,
    icon_url: icon_url || null
  });

  if (badge) {
    res.status(201).json(badge);
  } else {
    res.status(400);
    throw new Error('Invalid badge data');
  }
});

// @desc    Update a badge
// @route   PUT /api/badges/:id
// @access  Private/Admin
const updateBadge = asyncHandler(async (req, res) => {
  const badge = await Badge.findById(req.params.id);

  if (badge) {
    badge.name = req.body.name || badge.name;
    badge.description = req.body.description || badge.description;
    badge.icon_url = req.body.icon_url !== undefined ? req.body.icon_url : badge.icon_url;

    // Validate unlock_rule if provided
    if (req.body.unlock_rule !== undefined) {
      if (typeof req.body.unlock_rule !== 'object' || !req.body.unlock_rule.type || !req.body.unlock_rule.value) {
        res.status(400);
        throw new Error('Unlock rule must be an object with type and value properties');
      }

      const validTypes = ['xp_gte', 'challenges_completed_gte', 'points_balance_gte'];
      if (!validTypes.includes(req.body.unlock_rule.type)) {
        res.status(400);
        throw new Error('Unlock rule type must be one of: xp_gte, challenges_completed_gte, points_balance_gte');
      }

      if (typeof req.body.unlock_rule.value !== 'number' || req.body.unlock_rule.value < 0) {
        res.status(400);
        throw new Error('Unlock rule value must be a non-negative number');
      }

      badge.unlock_rule = req.body.unlock_rule;
    }

    const updatedBadge = await badge.save();
    res.json(updatedBadge);
  } else {
    res.status(404);
    throw new Error('Badge not found');
  }
});

// @desc    Delete a badge
// @route   DELETE /api/badges/:id
// @access  Private/Admin
const deleteBadge = asyncHandler(async (req, res) => {
  const badge = await Badge.findById(req.params.id);

  if (badge) {
    // Check if badge has been awarded to any users
    const awardCount = await EmployeeBadge.countDocuments({ badge: badge._id });

    if (awardCount > 0) {
      res.status(400);
      throw new Error('Cannot delete badge that has been awarded to users');
    }

    await badge.remove();
    res.json({ message: 'Badge removed' });
  } else {
    res.status(404);
    throw new Error('Badge not found');
  }
});

// @desc    Get badges for a specific employee
// @route   GET /api/employees/:id/badges
// @access  Private
const getEmployeeBadges = asyncHandler(async (req, res) => {
  const employeeId = req.params.id;

  // Verify employee exists
  const employeeExists = await User.findById(employeeId);
  if (!employeeExists) {
    res.status(404);
    throw new Error('Employee not found');
  }

  // Get badges with details
  const badges = await EmployeeBadge.find({ employee: employeeId })
    .sort({ earned_at: -1 })
    .populate({
      path: 'badge',
      select: 'name description icon_url unlock_rule'
    })
    .populate({
      path: 'employee',
      select: 'name email'
    });

  res.json(badges);
});

// @desc    Check if user has a specific badge
// @route   GET /api/employees/:id/badges/:badgeId/check
// @access  Private
const checkUserBadge = asyncHandler(async (req, res) => {
  const { id: employeeId, badgeId } = req.params;

  // Verify employee exists
  const employeeExists = await User.findById(employeeId);
  if (!employeeExists) {
    res.status(404);
    throw new Error('Employee not found');
  }

  // Verify badge exists
  const badgeExists = await Badge.findById(badgeId);
  if (!badgeExists) {
    res.status(404);
    throw new Error('Badge not found');
  }

  // Check if user has the badge
  const hasBadge = await EmployeeBadge.exists({
    employee: employeeId,
    badge: badgeId
  });

  res.json({
    employeeId,
    badgeId,
    has: hasBadge
  });
});

// @desc    Manually award a badge to a user (admin function)
// @route   POST /api/badges/:id/award
// @access  Private/Admin
const awardBadge = asyncHandler(async (req, res) => {
  const { badgeId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error('Please provide userId');
  }

  // Validate badge exists
  const badge = await Badge.findById(badgeId);
  if (!badge) {
    res.status(404);
    throw new Error('Badge not found');
  }

  // Validate user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user already has this badge
  const existingBadge = await EmployeeBadge.findOne({
    employee: userId,
    badge: badgeId
  });

  if (existingBadge) {
    res.status(400);
    throw new Error('User already has this badge');
  }

  // Award the badge
  const employeeBadge = await EmployeeBadge.create({
    employee: userId,
    badge: badgeId
  });

  // Send notification
  await NotificationService.notifyBadgeUnlock(userId, badge);

  // Populate for response
  await employeeBadge.populate([
    { path: 'employee', select: 'name email' },
    { path: 'badge', select: 'name description icon_url' }
  ]);

  res.status(201).json(employeeBadge);
});

export {
  getBadges,
  getBadgeById,
  createBadge,
  updateBadge,
  deleteBadge,
  getEmployeeBadges,
  checkUserBadge,
  awardBadge
};
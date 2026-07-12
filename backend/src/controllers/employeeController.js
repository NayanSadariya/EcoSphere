import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Department from '../models/Department.js';
import UserBadge from '../models/UserBadge.js';
import EmployeeBadge from '../models/EmployeeBadge.js';
import EmployeeParticipation from '../models/EmployeeParticipation.js';
import RewardRedemption from '../models/RewardRedemption.js';
// import { checkAndAwardUserBadges } from '../utils/badgeService.js';

// @desc    Get all users/employees
// @route   GET /api/employees
// @access  Private/Admin
const getEmployees = asyncHandler(async (req, res) => {
  const { department, role, status, page = 1, limit = 10, search } = req.query;

  // Build filter
  const filter = {};

  if (department) filter.department = department;
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter)
      .populate('department', 'name code')
      .select('-password_hash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);

  res.json({
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get a single user/employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('department', 'name code')
    .select('-password_hash');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update a user/employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Only allow role/status changes by admins
    if (req.body.role !== undefined) {
      user.role = req.body.role;
    }
    if (req.body.status !== undefined) {
      user.status = req.body.status;
    }

    // Department changes would need special handling
    if (req.body.department !== undefined) {
      const deptExists = await Department.findById(req.body.department);
      if (!deptExists) {
        res.status(400);
        throw new Error('Department not found');
      }
      user.department = req.body.department;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      department: updatedUser.department,
      role: updatedUser.role,
      status: updatedUser.status,
      xp_total: updatedUser.xp_total,
      points_balance: updatedUser.points_balance
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete a user/employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Prevent deleting yourself
    if (user._id.toString() === req.user.id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own account');
    }

    await user.remove();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user's badges
// @route   GET /api/employees/:id/badges
// @access  Private
const getUserBadges = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Check if user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get user's badges with badge details
  const userBadges = await UserBadge.find({ employee: userId })
    .populate({
      path: 'badge',
      select: 'name description icon_url'
    })
    .sort({ earned_at: -1 });

  res.json(userBadges);
});

// @desc    Get user's profile with stats
// @route   GET /api/employees/:id/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Check if user exists
  const user = await User.findById(userId)
    .populate('department', 'name code')
    .select('-password_hash');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get additional stats
  const [
    badgeCount,
    participationCount,
    redemptionCount
  ] = await Promise.all([
    UserBadge.countDocuments({ employee: userId }),
    EmployeeParticipation.countDocuments({
      employee: userId,
      approval_status: 'APPROVED'
    }),
    RewardRedemption.countDocuments({ user: userId })
  ]);

  res.json({
    ...user.toObject(),
    stats: {
      badgeCount,
      participationCount,
      redemptionCount
    }
  });
});

export {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getUserBadges,
  getUserProfile
};
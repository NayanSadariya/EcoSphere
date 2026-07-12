import asyncHandler from 'express-async-handler';
import EmployeeParticipation from '../models/EmployeeParticipation.js';
import User from '../models/User.js';
import CSRActivity from '../models/CSRActivity.js';
import Settings from '../models/Settings.js';
import BadgeService from '../utils/badgeService.js';
import NotificationService from '../utils/notificationService.js';

// @desc    Get all employee participations
// @route   GET /api/employee-participation
// @access  Private
const getEmployeeParticipations = asyncHandler(async (req, res) => {
  const { employee, activity, approval_status, page = 1, limit = 20 } = req.query;

  // Build filter
  const filter = {};

  if (employee) filter.employee = employee;
  if (activity) filter.activity = activity;
  if (approval_status) filter.approval_status = approval_status;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [participations, total] = await Promise.all([
    EmployeeParticipation.find(filter)
      .populate('employee', 'name email')
      .populate('activity', 'title description date')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    EmployeeParticipation.countDocuments(filter)
  ]);

  res.json({
    participations,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get participations for a specific employee
// @route   GET /api/employee-participation/employee/:employeeId
// @access  Private
const getEmployeeParticipationsByEmployee = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  // Verify employee exists
  const employeeExists = await User.findById(req.params.employeeId);
  if (!employeeExists) {
    res.status(404);
    throw new Error('Employee not found');
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [participations, total] = await Promise.all([
    EmployeeParticipation.find({ employee: req.params.employeeId })
      .populate('activity', 'title description date category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    EmployeeParticipation.countDocuments({ employee: req.params.employeeId })
  ]);

  res.json({
    participations,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get participations for a specific activity
// @route   GET /api/employee-participation/activity/:activityId
// @access  Private
const getEmployeeParticipationsByActivity = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  // Verify activity exists
  const activityExists = await CSRActivity.findById(req.params.activityId);
  if (!activityExists) {
    res.status(404);
    throw new Error('Activity not found');
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [participations, total] = await Promise.all([
    EmployeeParticipation.find({ activity: req.params.activityId })
      .populate('employee', 'name email department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    EmployeeParticipation.countDocuments({ activity: req.params.activityId })
  ]);

  res.json({
    participations,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Create a new employee participation
// @route   POST /api/employee-participation
// @access  Private
const createEmployeeParticipation = asyncHandler(async (req, res) => {
  const { employee, activity, proof_file_url } = req.body;

  // Validate required fields
  if (!employee || !activity) {
    res.status(400);
    throw new Error('Please provide employee and activity');
  }

  // Validate employee exists
  const employeeExists = await User.findById(employee);
  if (!employeeExists) {
    res.status(400);
    throw new Error('Employee not found');
  }

  // Validate activity exists
  const activityExists = await CSRActivity.findById(activity);
  if (!activityExists) {
    res.status(400);
    throw new Error('Activity not found');
  }

  // Check if participation already exists
  const existingParticipation = await EmployeeParticipation.findOne({ employee, activity });

  if (existingParticipation) {
    res.status(400);
    throw new Error('Participation already exists for this employee and activity');
  }

  const participation = await EmployeeParticipation.create({
    employee,
    activity,
    proof_file_url: proof_file_url || null,
    approval_status: 'PENDING'
  });

  if (participation) {
    res.status(201).json(participation);
  } else {
    res.status(400);
    throw new Error('Invalid employee participation data');
  }
});

// @desc    Update participation approval status
// @route   PATCH /api/employee-participation/:id
// @access  Private
const updateParticipationStatus = asyncHandler(async (req, res) => {
  const { approval_status } = req.body;

  // Validate approval_status
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
  if (!approval_status || !validStatuses.includes(approval_status)) {
    res.status(400);
    throw new Error('Please provide a valid approval status: PENDING, APPROVED, or REJECTED');
  }

  const participation = await EmployeeParticipation.findById(req.params.id)
    .populate('employee', 'name email points_balance xp_total')
    .populate('activity', 'title description');

  if (!participation) {
    res.status(404);
    throw new Error('Participation not found');
  }

  // Check evidence requirement if approving
  if (approval_status === 'APPROVED') {
    const settings = await Settings.findOne({});
    const evidenceRequired = settings ? settings.evidence_requirement_enabled : true;

    if (evidenceRequired && (!participation.proof_file_url || participation.proof_file_url.trim() === '')) {
      res.status(400);
      throw new Error('Proof file URL is required for approval when evidence requirement is enabled');
    }
  }

  // Update participation
  participation.approval_status = approval_status;
  if (approval_status === 'APPROVED' || approval_status === 'REJECTED') {
    participation.completion_date = new Date();
  }

  // If approving, award points and check for badges
  let pointsAwarded = 0;
  if (approval_status === 'APPROVED') {
    // For simplicity, we'll award fixed points - in reality this might come from activity config
    pointsAwarded = 10; // 10 points for participation
    participation.points_earned = pointsAwarded;

    // Update user's points and XP
    participation.employee.points_balance += pointsAwarded;
    participation.employee.xp_total += pointsAwarded;

    await participation.employee.save();
  }

  const updatedParticipation = await participation.save();

  // Send notification
  if (approval_status === 'APPROVED' || approval_status === 'REJECTED') {
    await NotificationService.notifyCSRParticipationDecision(updatedParticipation, approval_status === 'APPROVED');
  }

  // Check and award badges if points were updated
  if (approval_status === 'APPROVED') {
    await BadgeService.checkAndAwardUserBadges(participation.employee._id);
  }

  // Populate for response
  await updatedParticipation.populate([
    { path: 'employee', select: 'name email' },
    { path: 'activity', select: 'title description' }
  ]);

  res.json(updatedParticipation);
});

// @desc    Get participation by employee and activity
// @route   GET /api/employee-participation/:employeeId/:activityId
// @access  Private
const getParticipationByEmployeeAndActivity = asyncHandler(async (req, res) => {
  const participation = await EmployeeParticipation.findOne({
    employee: req.params.employeeId,
    activity: req.params.activityId
  })
    .populate('employee', 'name email')
    .populate('activity', 'title description date');

  if (participation) {
    res.json(participation);
  } else {
    res.status(404);
    throw new Error('Participation not found for this employee and activity');
  }
});

export {
  getEmployeeParticipations,
  getEmployeeParticipationsByEmployee,
  getEmployeeParticipationsByActivity,
  createEmployeeParticipation,
  updateParticipationStatus,
  getParticipationByEmployeeAndActivity
};
import asyncHandler from 'express-async-handler';
import ChallengeParticipation from '../models/ChallengeParticipation.js';
import User from '../models/User.js';
import Challenge from '../models/Challenge.js';
import BadgeService from '../utils/badgeService.js';
import NotificationService from '../utils/notificationService.js';

// @desc    Get all challenge participations
// @route   GET /api/challenge-participation
// @access  Private
const getChallengeParticipations = asyncHandler(async (req, res) => {
  const { challenge, employee, approval_status, page = 1, limit = 20 } = req.query;

  // Build filter
  const filter = {};

  if (challenge) filter.challenge = challenge;
  if (employee) filter.employee = employee;
  if (approval_status) filter.approval_status = approval_status;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [participations, total] = await Promise.all([
    ChallengeParticipation.find(filter)
      .populate('challenge', 'title description xp_value difficulty')
      .populate('employee', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ChallengeParticipation.countDocuments(filter)
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

// @desc    Get participations for a specific challenge
// @route   GET /api/challenge-participation/challenge/:challengeId
// @access  Private
const getChallengeParticipationsByChallenge = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  // Verify challenge exists
  const challengeExists = await Challenge.findById(req.params.challengeId);
  if (!challengeExists) {
    res.status(404);
    throw new Error('Challenge not found');
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [participations, total] = await Promise.all([
    ChallengeParticipation.find({ challenge: req.params.challengeId })
      .populate('employee', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ChallengeParticipation.countDocuments({ challenge: req.params.challengeId })
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
// @route   GET /api/challenge-participation/employee/:employeeId
// @access  Private
const getChallengeParticipationsByEmployee = asyncHandler(async (req, res) => {
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
    ChallengeParticipation.find({ employee: req.params.employeeId })
      .populate('challenge', 'title description xp_value deadline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ChallengeParticipation.countDocuments({ employee: req.params.employeeId })
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

// @desc    Create a new challenge participation
// @route   POST /api/challenge-participation
// @access  Private
const createChallengeParticipation = asyncHandler(async (req, res) => {
  const { challenge, employee } = req.body;

  // Validate required fields
  if (!challenge || !employee) {
    res.status(400);
    throw new Error('Please provide challenge and employee');
  }

  // Validate challenge exists
  const challengeExists = await Challenge.findById(challenge);
  if (!challengeExists) {
    res.status(400);
    throw new Error('Challenge not found');
  }

  // Validate employee exists
  const employeeExists = await User.findById(employee);
  if (!employeeExists) {
    res.status(400);
    throw new Error('Employee not found');
  }

  // Check if participation already exists
  const existingParticipation = await ChallengeParticipation.findOne({ challenge, employee });

  if (existingParticipation) {
    res.status(400);
    throw new Error('Participation already exists for this employee and challenge');
  }

  const participation = await ChallengeParticipation.create({
    challenge,
    employee,
    progress: 0,
    proof_file_url: null,
    approval_status: 'PENDING'
  });

  if (participation) {
    res.status(201).json(participation);
  } else {
    res.status(400);
    throw new Error('Invalid challenge participation data');
  }
});

// @desc    Update participation progress
// @route   PATCH /api/challenge-participation/:id/progress
// @access  Private
const updateParticipationProgress = asyncHandler(async (req, res) => {
  const { progress } = req.body;

  // Validate progress
  if (typeof progress !== 'number' || progress < 0 || progress > 100) {
    res.status(400);
    throw new Error('Progress must be a number between 0 and 100');
  }

  const participation = await ChallengeParticipation.findById(req.params.id)
    .populate('challenge', 'title description xp_value evidence_required')
    .populate('employee', 'name email points_balance xp_total');

  if (!participation) {
    res.status(404);
    throw new Error('Participation not found');
  }

  // Update progress
  participation.progress = progress;

  // If progress reaches 100%, we could auto-submit for review
  // But we'll leave that to manual submission for now

  const updatedParticipation = await participation.save();
  res.json(updatedParticipation);
});

// @desc    Update participation proof file URL
// @route   PATCH /api/challenge-participation/:id/proof
// @access  Private
const updateParticipationProof = asyncHandler(async (req, res) => {
  const { proof_file_url } = req.body;

  const participation = await ChallengeParticipation.findById(req.params.id)
    .populate('challenge', 'title description xp_value evidence_required')
    .populate('employee', 'name email');

  if (!participation) {
    res.status(404);
    throw new Error('Participation not found');
  }

  // Check if evidence is required for this challenge
  if (participation.challenge.evidence_required && (!proof_file_url || proof_file_url.trim() === '')) {
    res.status(400);
    throw new Error('Proof file URL is required for challenges that require evidence');
  }

  participation.proof_file_url = proof_file_url || null;
  const updatedParticipation = await participation.save();
  res.json(updatedParticipation);
});

// @desc    Update participation approval status
// @route   PATCH /api/challenge-participation/:id
// @access  Private
const updateParticipationStatus = asyncHandler(async (req, res) => {
  const { approval_status } = req.body;

  // Validate approval_status
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
  if (!approval_status || !validStatuses.includes(approval_status)) {
    res.status(400);
    throw new Error('Please provide a valid approval status: PENDING, APPROVED, or REJECTED');
  }

  const participation = await ChallengeParticipation.findById(req.params.id)
    .populate('challenge', 'title description xp_value')
    .populate('employee', 'name email points_balance xp_total');

  if (!participation) {
    res.status(404);
    throw new Error('Participation not found');
  }

  // Check evidence requirement if approving
  if (approval_status === 'APPROVED') {
    const Settings = require('../models/Settings.js');
    const settings = await Settings.findOne({});
    const evidenceRequired = settings ? settings.evidence_requirement_enabled : true;

    if (evidenceRequired && participation.challenge.evidence_required &&
        (!participation.proof_file_url || participation.proof_file_url.trim() === '')) {
      res.status(400);
      throw new Error('Proof file URL is required for approval when evidence is required');
    }
  }

  // Store previous status for comparison
  const previousStatus = participation.approval_status;

  // Update participation
  participation.approval_status = approval_status;
  if (approval_status === 'APPROVED' || approval_status === 'REJECTED') {
    participation.completion_date = new Date();
  }

  // If approving, award XP and check for badges
  if (approval_status === 'APPROVED' && previousStatus !== 'APPROVED') {
    // Award the XP from the challenge
    const xpToAward = participation.challenge.xp_value;
    participation.xp_awarded = xpToAward;

    // Update user's points and XP
    participation.employee.points_balance += xpToAward;
    participation.employee.xp_total += xpToAward;

    await participation.employee.save();
  }

  const updatedParticipation = await participation.save();

  // Send notification
  if ((approval_status === 'APPROVED' || approval_status === 'REJECTED') && previousStatus !== approval_status) {
    await NotificationService.notifyChallengeParticipationDecision(updatedParticipation, approval_status === 'APPROVED');
  }

  // Check and award badges if XP was updated
  if (approval_status === 'APPROVED' && previousStatus !== 'APPROVED') {
    await BadgeService.checkAndAwardUserBadges(participation.employee._id);
  }

  // Populate for response
  await updatedParticipation.populate([
    { path: 'challenge', select: 'title description xp_value' },
    { path: 'employee', select: 'name email' }
  ]);

  res.json(updatedParticipation);
});

// @desc    Get participation by challenge and employee
// @route   GET /api/challenge-participation/:challengeId/:employeeId
// @access  Private
const getParticipationByChallengeAndEmployee = asyncHandler(async (req, res) => {
  const participation = await ChallengeParticipation.findOne({
    challenge: req.params.challengeId,
    employee: req.params.employeeId
  })
    .populate('challenge', 'title description xp_value deadline')
    .populate('employee', 'name email');

  if (participation) {
    res.json(participation);
  } else {
    res.status(404);
    throw new Error('Participation not found for this challenge and employee');
  }
});

export {
  getChallengeParticipations,
  getChallengeParticipationsByChallenge,
  getChallengeParticipationsByEmployee,
  createChallengeParticipation,
  updateParticipationProgress,
  updateParticipationProof,
  updateParticipationStatus,
  getParticipationByChallengeAndEmployee
};
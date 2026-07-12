import asyncHandler from 'express-async-handler';
import Challenge from '../models/Challenge.js';
import Category from '../models/Category.js';

// Helper function to validate status transition
const validateStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    DRAFT: ['ACTIVE'],
    ACTIVE: ['UNDER_REVIEW'],
    UNDER_REVIEW: ['COMPLETED', 'ARCHIVED'],
    COMPLETED: [], // Can only go to ARCHIVED from any state
    ARCHIVED: [] // Terminal state
  };

  // Special case: any state can go to ARCHIVED
  if (newStatus === 'ARCHIVED') return true;

  return validTransitions[currentStatus] && validTransitions[currentStatus].includes(newStatus);
};

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Private
const getChallenges = asyncHandler(async (req, res) => {
  const { category, status, difficulty, page = 1, limit = 20 } = req.query;

  // Build filter
  const filter = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (difficulty) filter.difficulty = difficulty;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [challenges, total] = await Promise.all([
    Challenge.find(filter)
      .populate('category', 'name type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Challenge.countDocuments(filter)
  ]);

  res.json({
    challenges,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get a single challenge
// @route   GET /api/challenges/:id
// @access  Private
const getChallengeById = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id)
    .populate('category', 'name type');

  if (challenge) {
    res.json(challenge);
  } else {
    res.status(404);
    throw new Error('Challenge not found');
  }
});

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Private/Admin
const createChallenge = asyncHandler(async (req, res) => {
  const { title, category, description, xp_value, difficulty, evidence_required, deadline } = req.body;

  // Validate required fields
  if (!title || !category || xp_value === undefined || !difficulty) {
    res.status(400);
    throw new Error('Please provide title, category, xp_value, and difficulty');
  }

  // Validate category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error('Category not found');
  }

  // Validate xp_value
  if (xp_value < 0) {
    res.status(400);
    throw new Error('XP value must be non-negative');
  }

  // Validate difficulty
  const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
  if (!validDifficulties.includes(difficulty)) {
    res.status(400);
    throw new Error('Difficulty must be one of: EASY, MEDIUM, HARD');
  }

  // Validate evidence_required if provided
  if (evidence_required !== undefined && typeof evidence_required !== 'boolean') {
    res.status(400);
    throw new Error('Evidence_required must be a boolean');
  }

  const challenge = await Challenge.create({
    title,
    category,
    description: description || '',
    xp_value,
    difficulty,
    evidence_required: evidence_required || false,
    deadline: deadline || null,
    status: 'DRAFT'
  });

  if (challenge) {
    res.status(201).json(challenge);
  } else {
    res.status(400);
    throw new Error('Invalid challenge data');
  }
});

// @desc    Update a challenge
// @route   PUT /api/challenges/:i
// @access  Private/Admin
const updateChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);

  if (challenge) {
    challenge.title = req.body.title || challenge.title;
    challenge.description = req.body.description || challenge.description;

    // Validate category if provided
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        res.status(400);
        throw new Error('Category not found');
      }
      challenge.category = req.body.category;
    }

    // Validate xp_value if provided
    if (req.body.xp_value !== undefined) {
      if (req.body.xp_value < 0) {
        res.status(400);
        throw new Error('XP value must be non-negative');
      }
      challenge.xp_value = req.body.xp_value;
    }

    // Validate difficulty if provided
    if (req.body.difficulty) {
      const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
      if (!validDifficulties.includes(req.body.difficulty)) {
        res.status(400);
        throw new Error('Difficulty must be one of: EASY, MEDIUM, HARD');
      }
      challenge.difficulty = req.body.difficulty;
    }

    // Validate evidence_required if provided
    if (req.body.evidence_required !== undefined) {
      if (typeof req.body.evidence_required !== 'boolean') {
        res.status(400);
        throw new Error('Evidence_required must be a boolean');
      }
      challenge.evidence_required = req.body.evidence_required;
    }

    // Validate deadline if provided
    if (req.body.deadline !== undefined) {
      challenge.deadline = req.body.deadline || null;
    }

    // Note: Status changes should go through the dedicated endpoint

    const updatedChallenge = await challenge.save();
    res.json(updatedChallenge);
  } else {
    res.status(404);
    throw new Error('Challenge not found');
  }
});

// @desc    Change challenge status
// @route   PATCH /api/challenges/:id/status
// @access  Private/Admin
const changeChallengeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Please provide a status');
  }

  const challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    res.status(404);
    throw new Error('Challenge not found');
  }

  // Validate status
  const validStatuses = ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Status must be one of: DRAFT, ACTIVE, UNDER_REVIEW, COMPLETED, ARCHIVED');
  }

  // Validate transition
  if (!validateStatusTransition(challenge.status, status)) {
    res.status(400);
    throw new Error(`Invalid status transition from ${challenge.status} to ${status}`);
  }

  challenge.status = status;
  const updatedChallenge = await challenge.save();
  res.json(updatedChallenge);
});

// @desc    Delete a challenge
// @route   DELETE /api/challenges/:id
// @access  Private/Admin
const deleteChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);

  if (challenge) {
    // Check if challenge has any participations
    const ChallengeParticipation = require('../models/ChallengeParticipation.js');
    const participationCount = await ChallengeParticipation.countDocuments({ challenge: challenge._id });

    if (participationCount > 0) {
      res.status(400);
      throw new Error('Cannot delete challenge with existing participations. Please remove or reassign participations first.');
    }

    await challenge.remove();
    res.json({ message: 'Challenge removed' });
  } else {
    res.status(404);
    throw new Error('Challenge not found');
  }
});

export {
  getChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  changeChallengeStatus,
  deleteChallenge
};
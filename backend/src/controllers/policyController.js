import asyncHandler from 'express-async-handler';
import ESGPolicy from '../models/ESGPolicy.js';
import PolicyAcknowledgement from '../models/PolicyAcknowledgement.js';
import User from '../models/User.js';
import NotificationService from '../utils/notificationService.js';

// @desc    Get all policies
// @route   GET /api/policies
// @access  Private
const getPolicies = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  // Build filter
  const filter = {};
  if (status) filter.status = status;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [policies, total] = await Promise.all([
    ESGPolicy.find(filter)
      .sort({ effective_date: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ESGPolicy.countDocuments(filter)
  ]);

  res.json({
    policies,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get a single policy
// @route   GET /api/policies/:id
// @access  Private
const getPolicyById = asyncHandler(async (req, res) => {
  const policy = await ESGPolicy.findById(req.params.id);

  if (policy) {
    res.json(policy);
  } else {
    res.status(404);
    throw new Error('Policy not found');
  }
});

// @desc    Create a new policy
// @route   POST /api/policies
// @access  Private/Admin
const createPolicy = asyncHandler(async (req, res) => {
  const { title, description, version, effective_date } = req.body;

  // Validate required fields
  if (!title || !description || !version || !effective_date) {
    res.status(400);
    throw new Error('Please provide title, description, version, and effective_date');
  }

  // Check if policy with same version already exists
  const policyExists = await ESGPolicy.findOne({ version });

  if (policyExists) {
    res.status(400);
    throw new Error('Policy with this version already exists');
  }

  const policy = await ESGPolicy.create({
    title,
    description,
    version,
    effective_date: new Date(effective_date)
  });

  if (policy) {
    res.status(201).json(policy);
  } else {
    res.status(400);
    throw new Error('Invalid policy data');
  }
});

// @desc    Update a policy
// @route   PUT /api/policies/:id
// @access  Private/Admin
const updatePolicy = asyncHandler(async (req, res) => {
  const policy = await ESGPolicy.findById(req.params.id);

  if (policy) {
    policy.title = req.body.title || policy.title;
    policy.description = req.body.description || policy.description;
    if (req.body.version) {
      // Check if another policy with this version exists (excluding current)
      const existingPolicy = await ESGPolicy.findOne({
        version: req.body.version,
        _id: { $ne: req.params.id }
      });
      if (existingPolicy) {
        res.status(400);
        throw new Error('Policy with this version already exists');
      }
      policy.version = req.body.version;
    }
    if (req.body.effective_date) {
      policy.effective_date = new Date(req.body.effective_date);
    }

    const updatedPolicy = await policy.save();
    res.json(updatedPolicy);
  } else {
    res.status(404);
    throw new Error('Policy not found');
  }
});

// @desc    Delete a policy
// @route   DELETE /api/policies/:id
// @access  Private/Admin
const deletePolicy = asyncHandler(async (req, res) => {
  const policy = await ESGPolicy.findById(req.params.id);

  if (policy) {
    // Check if policy has any acknowledgements
    const acknowledgementCount = await PolicyAcknowledgement.countDocuments({ policy: policy._id });

    if (acknowledgementCount > 0) {
      res.status(400);
      throw new Error('Cannot delete policy that has been acknowledged by users');
    }

    await policy.remove();
    res.json({ message: 'Policy removed' });
  } else {
    res.status(404);
    throw new Error('Policy not found');
  }
});

// @desc    Acknowledge a policy
// @route   POST /api/policies/:id/acknowledge
// @access  Private
const acknowledgePolicy = asyncHandler(async (req, res) => {
  const policyId = req.params.id;
  const userId = req.user.id; // From auth middleware

  // Validate policy exists
  const policy = await ESGPolicy.findById(policyId);
  if (!policy) {
    res.status(404);
    throw new Error('Policy not found');
  }

  // Validate user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user has already acknowledged this policy
  const existingAcknowledgement = await PolicyAcknowledgement.findOne({
    policy: policyId,
    employee: userId
  });

  if (existingAcknowledgement) {
    // If already acknowledged, just update the date
    existingAcknowledgement.acknowledged_date = new Date();
    await existingAcknowledgement.save();
    res.json({ message: 'Policy acknowledgement updated', acknowledgement: existingAcknowledgement });
  } else {
    // Create new acknowledgement
    const acknowledgement = await PolicyAcknowledgement.create({
      employee: userId,
      policy: policyId,
      acknowledged_date: new Date()
    });

    res.status(201).json({ message: 'Policy acknowledged successfully', acknowledgement });
  }
});

// @desc    Get acknowledgements for a policy
// @route   GET /api/policies/:id/acknowledgements
// @access  Private
const getPolicyAcknowledgements = asyncHandler(async (req, res) => {
  const policyId = req.params.id;

  // Validate policy exists
  const policyExists = await ESGPolicy.findById(policyId);
  if (!policyExists) {
    res.status(404);
    throw new Error('Policy not found');
  }

  const acknowledgements = await PolicyAcknowledgement.find({ policy: policyId })
    .sort({ acknowledged_date: -1 })
    .populate({
      path: 'employee',
      select: 'name email department'
    })
    .populate({
      path: 'policy',
      select: 'title version effective_date'
    });

  res.json(acknowledgements);
});

// @desc    Get acknowledgement status for a user
// @route   GET /api/users/:userId/policies/:policyId/acknowledgement
// @access  Private
const getUserPolicyAcknowledgement = asyncHandler(async (req, res) => {
  const { userId, policyId } = req.params;

  // Validate user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    res.status(404);
    throw new Error('User not found');
  }

  // Validate policy exists
  const policyExists = await ESGPolicy.findById(policyId);
  if (!policyExists) {
    res.status(404);
    throw new Error('Policy not found');
  }

  const acknowledgement = await PolicyAcknowledgement.findOne({
    employee: userId,
    policy: policyId
  })
    .populate({
      path: 'employee',
      select: 'name email'
    })
    .populate({
      path: 'policy',
      select: 'title version'
    });

  if (acknowledgement) {
    res.json(acknowledgement);
  } else {
    // Return object indicating not acknowledged
    res.json({
      employee: userId,
      policy: policyId,
      acknowledged_date: null
    });
  }
});

// @desc    Get unacknowledged policies for a user (for reminders)
// @route   GET /api/users/:userId/policies/unacknowledged
// @access  Private
const getUnacknowledgedPolicies = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Validate user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get all active policies
  const policies = await ESGPolicy.find(); // In a real app, we might filter by effective_date

  // Get acknowledgements for this user
  const acknowledgements = await PolicyAcknowledgement.find({ employee: userId })
    .select('policy');

  const acknowledgedIds = acknowledgements.map(a => a.policy.toString());

  // Filter to get unacknowledged policies
  const unacknowledged = policies.filter(p => !acknowledgedIds.includes(p._id.toString()));

  // Add acknowledgement status
  const result = unacknowledged.map(p => ({
    _id: p._id,
    title: p.title,
    version: p.version,
    effective_date: p.effective_date,
    acknowledged_date: null
  }));

  res.json(result);
});

export {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  acknowledgePolicy,
  getPolicyAcknowledgements,
  getUserPolicyAcknowledgement,
  getUnacknowledgedPolicies
};
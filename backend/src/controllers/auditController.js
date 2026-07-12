import asyncHandler from 'express-async-handler';
import Audit from '../models/Audit.js';
import Department from '../models/Department.js';
import User from '../models/User.js';

// @desc    Get all audits
// @route   GET /api/audits
// @access  Private
const getAudits = asyncHandler(async (req, res) => {
  const { department, status, startDate, endDate, page = 1, limit = 20 } = req.query;

  // Build filter
  const filter = {};

  if (department) filter.department = department;
  if (status) filter.status = status;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [audits, total] = await Promise.all([
    Audit.find(filter)
      .populate('department', 'name code')
      .populate('auditor', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Audit.countDocuments(filter)
  ]);

  res.json({
    audits,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get a single audit
// @route   GET /api/audits/:id
// @access  Private
const getAuditById = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id)
    .populate('department', 'name code')
    .populate('auditor', 'name email');

  if (audit) {
    res.json(audit);
  } else {
    res.status(404);
    throw new Error('Audit not found');
  }
});

// @desc    Create a new audit
// @route   POST /api/audits
// @access  Private/Admin
const createAudit = asyncHandler(async (req, res) => {
  const { department, scope, date, auditor } = req.body;

  // Validate required fields
  if (!department || !scope || !date || !auditor) {
    res.status(400);
    throw new Error('Please provide department, scope, date, and auditor');
  }

  // Validate department exists
  const departmentExists = await Department.findById(department);
  if (!departmentExists) {
    res.status(400);
    throw new Error('Department not found');
  }

  // Validate auditor exists
  const auditorExists = await User.findById(auditor);
  if (!auditorExists) {
    res.status(400);
    throw new Error('Auditor not found');
  }

  const audit = await Audit.create({
    department,
    scope,
    date: new Date(date),
    auditor
  });

  if (audit) {
    res.status(201).json(audit);
  } else {
    res.status(400);
    throw new Error('Invalid audit data');
  }
});

// @desc    Update an audit
// @route   PUT /api/audits/:id
// @access  Private/Admin
const updateAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);

  if (audit) {
    audit.department = req.body.department || audit.department;
    audit.scope = req.body.scope || audit.scope;
    if (req.body.date) {
      audit.date = new Date(req.body.date);
    }
    audit.auditor = req.body.auditor || audit.auditor;
    audit.status = req.body.status || audit.status;

    const updatedAudit = await audit.save();
    res.json(updatedAudit);
  } else {
    res.status(404);
    throw new Error('Audit not found');
  }
});

// @desc    Delete an audit
// @route   DELETE /api/audits/:id
// @access  Private/Admin
const deleteAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);

  if (audit) {
    // Check if audit has any compliance issues
    const ComplianceIssue = require('../models/ComplianceIssue.js');
    const issueCount = await ComplianceIssue.countDocuments({ audit: audit._id });

    if (issueCount > 0) {
      res.status(400);
      throw new Error('Cannot delete audit that has associated compliance issues');
    }

    await audit.remove();
    res.json({ message: 'Audit removed' });
  } else {
    res.status(404);
    throw new Error('Audit not found');
  }
});

// @desc    Start an audit (change status to in_progress)
// @route   PATCH /api/audits/:id/start
// @access  Private/Admin
const startAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);

  if (audit) {
    if (audit.status !== 'scheduled') {
      res.status(400);
      throw new Error('Only scheduled audits can be started');
    }

    audit.status = 'in_progress';
    const updatedAudit = await audit.save();
    res.json(updatedAudit);
  } else {
    res.status(404);
    throw new Error('Audit not found');
  }
});

// @desc    Complete an audit (change status to completed)
// @route   PATCH /api/audits/:id/complete
// @access  Private/Admin
const completeAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);

  if (audit) {
    if (audit.status !== 'in_progress') {
      res.status(400);
      throw new Error('Only in-progress audits can be completed');
    }

    audit.status = 'completed';
    const updatedAudit = await audit.save();
    res.json(updatedAudit);
  } else {
    res.status(404);
    throw new Error('Audit not found');
  }
});

// @desc    Cancel an audit (change status to cancelled)
// @route   PATCH /api/audits/:id/cancel
// @access  Private/Admin
const cancelAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);

  if (audit) {
    if (audit.status === 'completed') {
      res.status(400);
      throw new Error('Completed audits cannot be cancelled');
    }

    audit.status = 'cancelled';
    const updatedAudit = await audit.save();
    res.json(updatedAudit);
  } else {
    res.status(404);
    throw new Error('Audit not found');
  }
});

export default {
  getAudits,
  getAuditById,
  createAudit,
  updateAudit,
  deleteAudit,
  startAudit,
  completeAudit,
  cancelAudit
};
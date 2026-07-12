import asyncHandler from 'express-async-handler';
import ComplianceIssue from '../models/ComplianceIssue.js';
import Audit from '../models/Audit.js';
import User from '../models/User.js';
import ComplianceService from '../utils/complianceService.js';
import NotificationService from '../utils/notificationService.js';

const getComplianceIssues = asyncHandler(async (req, res) => {
  const { audit, severity, status, owner, page = 1, limit = 20 } = req.query;

  // Build filter
  const filter = {};

  if (audit) filter.audit = audit;
  if (severity) filter.severity = severity;
  if (status) filter.status = status;
  if (owner) filter.owner = owner;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [issues, total] = await Promise.all([
    ComplianceIssue.find(filter)
      .populate('audit', 'scope date department')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ComplianceIssue.countDocuments(filter)
  ]);

  res.json({
    issues,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

const getComplianceIssueById = asyncHandler(async (req, res) => {
  const issue = await ComplianceIssue.findById(req.params.id)
    .populate('audit', 'scope date department')
    .populate('owner', 'name email')
    .populate({
      path: 'audit.department',
      select: 'name code'
    });

  if (issue) {
    res.json(issue);
  } else {
    res.status(404);
    throw new Error('Compliance issue not found');
  }
});

const createComplianceIssue = asyncHandler(async (req, res) => {
  const { audit, severity, description, owner, due_date } = req.body;

  // Validate required fields
  if (!audit || !severity || !description || !owner || !due_date) {
    res.status(400);
    throw new Error('Please provide audit, severity, description, owner, and due_date');
  }

  // Validate audit exists
  const auditExists = await Audit.findById(audit);
  if (!auditExists) {
    res.status(400);
    throw new Error('Audit not found');
  }

  // Validate owner exists
  const ownerExists = await User.findById(owner);
  if (!ownerExists) {
    res.status(400);
    throw new Error('Owner not found');
  }

  // Validate severity
  const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  if (!validSeverities.includes(severity)) {
    res.status(400);
    throw new Error('Severity must be one of: LOW, MEDIUM, HIGH, CRITICAL');
  }

  // Validate due_date is in the future
  const dueDate = new Date(due_date);
  if (isNaN(dueDate.getTime())) {
    res.status(400);
    throw new Error('Invalid due_date format');
  }

  const complianceIssue = await ComplianceIssue.create({
    audit,
    severity,
    description,
    owner,
    due_date: dueDate,
    status: 'OPEN'
  });

  if (complianceIssue) {
    // Send notification for new compliance issue
    await NotificationService.notifyNewComplianceIssue(complianceIssue);

    res.status(201).json(complianceIssue);
  } else {
    res.status(400);
    throw new Error('Invalid compliance issue data');
  }
});

const updateComplianceIssue = asyncHandler(async (req, res) => {
  const issue = await ComplianceIssue.findById(req.params.id)
    .populate('audit', 'scope date department')
    .populate('owner', 'name email');

  if (issue) {
    issue.audit = req.body.audit || issue.audit;
    issue.severity = req.body.severity || issue.severity;
    issue.description = req.body.description || issue.description;
    issue.owner = req.body.owner || issue.owner;
    if (req.body.due_date) {
      issue.due_date = new Date(req.body.due_date);
    }
    issue.status = req.body.status || issue.status;

    // Validate severity if provided
    if (req.body.severity) {
      const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      if (!validSeverities.includes(req.body.severity)) {
        res.status(400);
        throw new Error('Severity must be one of: LOW, MEDIUM, HIGH, CRITICAL');
      }
    }

    const updatedIssue = await issue.save();
    res.json(updatedIssue);
  } else {
    res.status(404);
    throw new Error('Compliance issue not found');
  }
});

const deleteComplianceIssue = asyncHandler(async (req, res) => {
  const issue = await ComplianceIssue.findById(req.params.id);

  if (issue) {
    await issue.remove();
    res.json({ message: 'Compliance issue removed' });
  } else {
    res.status(404);
    throw new Error('Compliance issue not found');
  }
});

const getOverdueIssues = asyncHandler(async (req, res) => {
  const { departmentId, page = 1, limit = 20 } = req.query;

  // Build filter for overdue issues
  const filter = {
    status: 'OPEN',
    due_date: { $lt: new Date() }
  };

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [issues, total] = await Promise.all([
    ComplianceIssue.find(filter)
      .populate('audit', 'scope date department')
      .populate('owner', 'name email')
      .sort({ due_date: 1 }) // Most overdue first
      .skip(skip)
      .limit(parseInt(limit)),
    ComplianceIssue.countDocuments(filter)
  ]);

  res.json({
    issues,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

const checkAndNotifyOverdueIssues = asyncHandler(async (req, res) => {
  try {
    const result = await ComplianceService.checkAndNotifyOverdueIssues();
    res.json(result);
  } catch (error) {
    res.status(500);
    throw new Error('Error checking and notifying overdue issues');
  }
});

const getComplianceStatistics = asyncHandler(async (req, res) => {
  try {
    const stats = await ComplianceService.getStatistics(req.query);
    res.json(stats);
  } catch (error) {
    res.status(500);
    throw new Error('Error retrieving compliance statistics');
  }
});

export {
  getComplianceIssues,
  getComplianceIssueById,
  createComplianceIssue,
  updateComplianceIssue,
  deleteComplianceIssue,
  getOverdueIssues,
  checkAndNotifyOverdueIssues,
  getComplianceStatistics
};
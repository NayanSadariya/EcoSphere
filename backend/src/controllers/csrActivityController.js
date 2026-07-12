import asyncHandler from 'express-async-handler';
import CSRActivity from '../models/CSRActivity.js';
import Category from '../models/Category.js';
import Department from '../models/Department.js';

// @desc    Get all CSR activities
// @route   GET /api/csr-activities
// @access  Private
const getCSRActivities = asyncHandler(async (req, res) => {
  const { category, department, startDate, endDate, page = 1, limit = 20 } = req.query;

  // Build filter
  const filter = {};

  if (category) filter.category = category;
  if (department) filter.department = department;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [activities, total] = await Promise.all([
    CSRActivity.find(filter)
      .populate('category', 'name type')
      .populate('department', 'name code')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    CSRActivity.countDocuments(filter)
  ]);

  res.json({
    activities,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get a single CSR activity
// @route   GET /api/csr-activities/:id
// @access  Private
const getCSRActivityById = asyncHandler(async (req, res) => {
  const activity = await CSRActivity.findById(req.params.id)
    .populate('category', 'name type')
    .populate('department', 'name code');

  if (activity) {
    res.json(activity);
  } else {
    res.status(404);
    throw new Error('CSR activity not found');
  }
});

// @desc    Create a new CSR activity
// @route   POST /api/csr-activities
// @access  Private/Admin
const createCSRActivity = asyncHandler(async (req, res) => {
  const { title, category, department, date, description } = req.body;

  // Validate required fields
  if (!title || !category || !department) {
    res.status(400);
    throw new Error('Please provide title, category, and department');
  }

  // Validate category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error('Category not found');
  }

  // Validate department exists
  const departmentExists = await Department.findById(department);
  if (!departmentExists) {
    res.status(400);
    throw new Error('Department not found');
  }

  const activity = await CSRActivity.create({
    title,
    category,
    department,
    date: date || new Date(),
    description
  });

  if (activity) {
    res.status(201).json(activity);
  } else {
    res.status(400);
    throw new Error('Invalid CSR activity data');
  }
});

// @desc    Update a CSR activity
// @route   PUT /api/csr-activities/:id
// @access  Private/Admin
const updateCSRActivity = asyncHandler(async (req, res) => {
  const activity = await CSRActivity.findById(req.params.id);

  if (activity) {
    activity.title = req.body.title || activity.title;
    activity.description = req.body.description || activity.description;

    // Validate category if provided
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        res.status(400);
        throw new Error('Category not found');
      }
      activity.category = req.body.category;
    }

    // Validate department if provided
    if (req.body.department) {
      const departmentExists = await Department.findById(req.body.department);
      if (!departmentExists) {
        res.status(400);
        throw new Error('Department not found');
      }
      activity.department = req.body.department;
    }

    if (req.body.date) {
      activity.date = req.body.date;
    }

    const updatedActivity = await activity.save();
    res.json(updatedActivity);
  } else {
    res.status(404);
    throw new Error('CSR activity not found');
  }
});

// @desc    Delete a CSR activity
// @route   DELETE /api/csr-activities/:id
// @access  Private/Admin
const deleteCSRActivity = asyncHandler(async (req, res) => {
  const activity = await CSRActivity.findById(req.params.id);

  if (activity) {
    // Check if activity has any participations
    const participationCount = await EmployeeParticipation.countDocuments({ activity: activity._id });

    if (participationCount > 0) {
      res.status(400);
      throw new Error('Cannot delete CSR activity with existing participations. Please remove or reassign participations first.');
    }

    await activity.remove();
    res.json({ message: 'CSR activity removed' });
  } else {
    res.status(404);
    throw new Error('CSR activity not found');
  }
});

export {
  getCSRActivities,
  getCSRActivityById,
  createCSRActivity,
  updateCSRActivity,
  deleteCSRActivity
};
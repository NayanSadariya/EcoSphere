import asyncHandler from 'express-async-handler';
import Department from '../models/Department.js';
import User from '../models/User.js';
import DepartmentScore from '../models/DepartmentScore.js';
import ScoringService from '../utils/scoringService.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({})
    .populate('head', 'name email')
    .populate('parent_department', 'name code')
    .sort({ name: 1 });

  res.json(departments);
});

// @desc    Get a single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id)
    .populate('head', 'name email')
    .populate('parent_department', 'name code');

  if (department) {
    res.json(department);
  } else {
    res.status(404);
    throw new Error('Department not found');
  }
});

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, head, parent_department } = req.body;

  // Validate required fields
  if (!name || !code) {
    res.status(400);
    throw new Error('Please provide name and code');
  }

  // Check if department code already exists
  const departmentExists = await Department.findOne({ code });

  if (departmentExists) {
    res.status(400);
    throw new Error('Department with this code already exists');
  }

  // Validate head if provided
  if (head) {
    const headExists = await User.findById(head);
    if (!headExists) {
      res.status(400);
      throw new Error('Head user not found');
    }
  }

  // Validate parent department if provided
  if (parent_department) {
    const parentExists = await Department.findById(parent_department);
    if (!parentExists) {
      res.status(400);
      throw new Error('Parent department not found');
    }
  }

  const department = await Department.create({
    name,
    code,
    head: head || null,
    parent_department: parent_department || null,
    employee_count: 0
  });

  if (department) {
    res.status(201).json(department);
  } else {
    res.status(400);
    throw new Error('Invalid department data');
  }
});

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (department) {
    department.name = req.body.name || department.name;
    department.code = req.body.code || department.code;

    // Validate head if provided
    if (req.body.head !== undefined) {
      if (req.body.head === null) {
        department.head = null;
      } else {
        const headExists = await User.findById(req.body.head);
        if (!headExists) {
          res.status(400);
          throw new Error('Head user not found');
        }
        department.head = req.body.head;
      }
    }

    // Validate parent department if provided
    if (req.body.parent_department !== undefined) {
      if (req.body.parent_department === null) {
        department.parent_department = null;
      } else {
        const parentExists = await Department.findById(req.body.parent_department);
        if (!parentExists) {
          res.status(400);
          throw new Error('Parent department not found');
        }
        department.parent_department = req.body.parent_department;
      }
    }

    const updatedDepartment = await department.save();
    res.json(updatedDepartment);
  } else {
    res.status(404);
    throw new Error('Department not found');
  }
});

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (department) {
    // Check if department has employees
    const employeeCount = await User.countDocuments({ department: department._id });
    if (employeeCount > 0) {
      res.status(400);
      throw new Error('Cannot delete department with employees. Please reassign or delete employees first.');
    }

    // Check if department has child departments
    const childCount = await Department.countDocuments({ parent_department: department._id });
    if (childCount > 0) {
      res.status(400);
      throw new Error('Cannot delete department with sub-departments. Please reassign or delete them first.');
    }

    await department.remove();
    res.json({ message: 'Department removed' });
  } else {
    res.status(404);
    throw new Error('Department not found');
  }
});

// @desc    Get department score
// @route   GET /api/departments/:id/score
// @access  Private
const getDepartmentScore = asyncHandler(async (req, res) => {
  const departmentScore = await DepartmentScore.findOne({
    department: req.params.id
  }).populate('department', 'name code');

  if (departmentScore) {
    res.json(departmentScore);
  } else {
    // If no score exists, calculate and create one
    try {
      const score = await ScoringService.calculateAndUpdateDepartmentScore(req.params.id);
      res.json(score);
    } catch (error) {
      res.status(404);
      throw new Error('Department not found or error calculating score');
    }
  }
});

export {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentScore
};
import asyncHandler from 'express-async-handler';
import DepartmentScore from '../models/DepartmentScore.js';
import Department from '../models/Department.js';
import ScoringService from '../utils/scoringService.js';

const getDepartmentScores = asyncHandler(async (req, res) => {
  const { department, page = 1, limit = 20 } = req.query;

  // Build filter
  const filter = {};
  if (department) filter.department = department;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [scores, total] = await Promise.all([
    DepartmentScore.find(filter)
      .populate('department', 'name code')
      .sort({ calculated_at: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    DepartmentScore.countDocuments(filter)
  ]);

  res.json({
    scores,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get a single department score
// @route   GET /api/department-scores/:id
// @access  Private
const getDepartmentScoreById = asyncHandler(async (req, res) => {
  const score = await DepartmentScore.findById(req.params.id)
    .populate('department', 'name code');

  if (score) {
    res.json(score);
  } else {
    res.status(404);
    throw new Error('Department score not found');
  }
});

// @desc    Get score for a specific department
// @route   GET /api/departments/:departmentId/score
// @access  Private
const getDepartmentScoreByDeptId = asyncHandler(async (req, res) => {
  const score = await DepartmentScore.findOne({
    department: req.params.departmentId
  }).populate('department', 'name code');

  if (score) {
    res.json(score);
  } else {
    // If no score exists, calculate and create one
    try {
      const calculatedScore = await ScoringService.calculateAndUpdateDepartmentScore(req.params.departmentId);
      res.json(calculatedScore);
    } catch (error) {
      res.status(404);
      throw new Error('Department not found or error calculating score');
    }
  }
});

// @desc    Calculate and update department score
// @route   POST /api/department-scores/:id/calculate
// @access  Private/Admin
const calculateDepartmentScore = asyncHandler(async (req, res) => {
  try {
    const score = await ScoringService.calculateAndUpdateDepartmentScore(req.params.id);
    res.json({
      message: 'Department score calculated and updated successfully',
      score
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error calculating department score');
  }
});

// @desc    Calculate and update all department scores
// @route   POST /api/department-scores/calculate-all
// @access  Private/Admin
const calculateAllDepartmentScores = asyncHandler(async (req, res) => {
  try {
    // Get all departments
    const departments = await Department.find({ status: 'active' });

    // Calculate scores for each department
    const results = [];
    for (const dept of departments) {
      try {
        const score = await ScoringService.calculateAndUpdateDepartmentScore(dept._id);
        results.push({
          department: dept._id,
          departmentName: dept.name,
          success: true,
          score
        });
      } catch (error) {
        results.push({
          department: dept._id,
          departmentName: dept.name,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Department scores calculation completed',
      results
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error calculating department scores');
  }
});

// @desc    Get organizational ESG score
// @route   GET /api/org/esg-score
// @access  Private
const getOrganizationalESGScore = asyncHandler(async (req, res) => {
  try {
    const score = await ScoringService.calculateOrganizationalESGScore();
    res.json({
      esg_score: score,
      calculated_at: new Date()
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error calculating organizational ESG score');
  }
});

// @desc    Calculate and update organizational ESG score
// @route   POST /api/org/esg-score/calculate
// @access  Private/Admin
const calculateOrganizationalESGScore = asyncHandler(async (req, res) => {
  try {
    const score = await ScoringService.calculateOrganizationalESGScore();
    res.json({
      message: 'Organizational ESG score calculated successfully',
      esg_score: score,
      calculated_at: new Date()
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error calculating organizational ESG score');
  }
});

export {
  getDepartmentScores,
  getDepartmentScoreById,
  getDepartmentScoreByDeptId,
  calculateDepartmentScore,
  calculateAllDepartmentScores,
  getOrganizationalESGScore,
  calculateOrganizationalESGScore
};
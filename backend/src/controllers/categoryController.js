import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import CSRActivity from '../models/CSRActivity.js';
import Challenge from '../models/Challenge.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;

  // Build filter
  const filter = {};
  if (type) filter.type = type;

  const categories = await Category.find(filter)
    .sort({ name: 1 });

  res.json(categories);
});

// @desc    Get a single category
// @route   GET /api/categories/:id
// @access  Private
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, type } = req.body;

  // Validate required fields
  if (!name || !type) {
    res.status(400);
    throw new Error('Please provide name and type');
  }

  // Validate type
  const validTypes = ['CSR_ACTIVITY', 'CHALLENGE'];
  if (!validTypes.includes(type)) {
    res.status(400);
    throw new Error('Type must be either CSR_ACTIVITY or CHALLENGE');
  }

  // Check if category with same name and type already exists
  const categoryExists = await Category.findOne({ name, type });

  if (categoryExists) {
    res.status(400);
    throw new Error('Category with this name and type already exists');
  }

  const category = await Category.create({
    name,
    type,
    status: 'active'
  });

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error('Invalid category data');
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = req.body.name || category.name;
    category.type = req.body.type || category.type;
    // Note: We don't allow changing status directly - use specific endpoints for that

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    // Check if category has associated CSR activities or challenges
    const [csrCount, challengeCount] = await Promise.all([
      CSRActivity.countDocuments({ category: category._id }),
      Challenge.countDocuments({ category: category._id })
    ]);

    if (csrCount > 0 || challengeCount > 0) {
      res.status(400);
      throw new Error('Cannot delete category with associated activities or challenges');
    }

    await category.remove();
    res.json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Activate a category
// @route   PUT /api/categories/:id/activate
// @access  Private/Admin
const activateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    category.status = 'active';
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Deactivate a category
// @route   PUT /api/categories/:id/deactivate
// @access  Private/Admin
const deactivateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    category.status = 'inactive';
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  activateCategory,
  deactivateCategory
};
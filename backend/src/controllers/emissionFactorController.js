import asyncHandler from 'express-async-handler';
import EmissionFactor from '../models/EmissionFactor.js';
import CarbonTransaction from '../models/CarbonTransaction.js';

// @desc    Get all emission factors
// @route   GET /api/emission-factors
// @access  Private
const getEmissionFactors = asyncHandler(async (req, res) => {
  const { category } = req.query;

  // Build filter
  const filter = {};
  if (category) filter.category = category;

  const emissionFactors = await EmissionFactor.find(filter)
    .sort({ name: 1 });

  res.json(emissionFactors);
});

// @desc    Get a single emission factor
// @route   GET /api/emission-factors/:id
// @access  Private
const getEmissionFactorById = asyncHandler(async (req, res) => {
  const emissionFactor = await EmissionFactor.findById(req.params.id);

  if (emissionFactor) {
    res.json(emissionFactor);
  } else {
    res.status(404);
    throw new Error('Emission factor not found');
  }
});

// @desc    Create a new emission factor
// @route   POST /api/emission-factors
// @access  Private/Admin
const createEmissionFactor = asyncHandler(async (req, res) => {
  const { name, category, unit, co2_factor_value } = req.body;

  // Validate required fields
  if (!name || !category || !unit || typeof co2_factor_value !== 'number') {
    res.status(400);
    throw new Error('Please provide name, category, unit, and co2_factor_value');
  }

  // Check if emission factor with same name and category already exists
  const factorExists = await EmissionFactor.findOne({ name, category });

  if (factorExists) {
    res.status(400);
    throw new Error('Emission factor with this name and category already exists');
  }

  const emissionFactor = await EmissionFactor.create({
    name,
    category,
    unit,
    co2_factor_value
  });

  if (emissionFactor) {
    res.status(201).json(emissionFactor);
  } else {
    res.status(400);
    throw new Error('Invalid emission factor data');
  }
});

// @desc    Update an emission factor
// @route   PUT /api/emission-factors/:id
// @access  Private/Admin
const updateEmissionFactor = asyncHandler(async (req, res) => {
  const emissionFactor = await EmissionFactor.findById(req.params.id);

  if (emissionFactor) {
    emissionFactor.name = req.body.name || emissionFactor.name;
    emissionFactor.category = req.body.category || emissionFactor.category;
    emissionFactor.unit = req.body.unit || emissionFactor.unit;
    if (req.body.co2_factor_value !== undefined) {
      emissionFactor.co2_factor_value = req.body.co2_factor_value;
    }

    const updatedEmissionFactor = await emissionFactor.save();
    res.json(updatedEmissionFactor);
  } else {
    res.status(404);
    throw new Error('Emission factor not found');
  }
});

// @desc    Delete an emission factor
// @route   DELETE /api/emission-factors/:id
// @access  Private/Admin
const deleteEmissionFactor = asyncHandler(async (req, res) => {
  const emissionFactor = await EmissionFactor.findById(req.params.id);

  if (emissionFactor) {
    // Check if emission factor is used in any carbon transactions
    const usageCount = await CarbonTransaction.countDocuments({
      emission_factor: emissionFactor._id
    });

    if (usageCount > 0) {
      res.status(400);
      throw new Error('Cannot delete emission factor that is used in carbon transactions');
    }

    await emissionFactor.remove();
    res.json({ message: 'Emission factor removed' });
  } else {
    res.status(404);
    throw new Error('Emission factor not found');
  }
});

export {
  getEmissionFactors,
  getEmissionFactorById,
  createEmissionFactor,
  updateEmissionFactor,
  deleteEmissionFactor
};
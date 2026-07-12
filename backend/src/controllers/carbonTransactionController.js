import asyncHandler from 'express-async-handler';
import CarbonTransaction from '../models/CarbonTransaction.js';
import EmissionFactor from '../models/EmissionFactor.js';
import Department from '../models/Department.js';
import AutoEmissionService from '../utils/autoEmissionService.js';

// @desc    Get all carbon transactions
// @route   GET /api/carbon-transactions
// @access  Private
const getCarbonTransactions = asyncHandler(async (req, res) => {
  const { department, source_type, is_auto_calculated, startDate, endDate, page = 1, limit = 20 } = req.query;

  // Build filter
  const filter = {};

  if (department) filter.department = department;
  if (source_type) filter.source_type = source_type;
  if (is_auto_calculated !== undefined) filter.is_auto_calculated = is_auto_calculated === 'true';

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [transactions, total] = await Promise.all([
    CarbonTransaction.find(filter)
      .populate('department', 'name code')
      .populate('emission_factor', 'name category unit')
      .populate('source_record_id', 'date') // Limited population for source records
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    CarbonTransaction.countDocuments(filter)
  ]);

  res.json({
    transactions,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get a single carbon transaction
// @route   GET /api/carbon-transactions/:id
// @access  Private
const getCarbonTransactionById = asyncHandler(async (req, res) => {
  const transaction = await CarbonTransaction.findById(req.params.id)
    .populate('department', 'name code')
    .populate('emission_factor', 'name category unit co2_factor_value');

  if (transaction) {
    res.json(transaction);
  } else {
    res.status(404);
    throw new Error('Carbon transaction not found');
  }
});

// @desc    Create a new carbon transaction (manual)
// @route   POST /api/carbon-transactions
// @access  Private
const createCarbonTransaction = asyncHandler(async (req, res) => {
  const { department, source_type, source_record_id, emission_factor, calculated_co2, date } = req.body;

  // Validate required fields
  if (!department || !source_type || !source_record_id || !emission_factor || typeof calculated_co2 !== 'number') {
    res.status(400);
    throw new Error('Please provide department, source_type, source_record_id, emission_factor, and calculated_co2');
  }

  // Validate source_type
  const validSourceTypes = ['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET'];
  if (!validSourceTypes.includes(source_type)) {
    res.status(400);
    throw new Error('Source type must be one of: PURCHASE, MANUFACTURING, EXPENSE, FLEET');
  }

  // Validate that calculated_co2 is non-negative
  if (calculated_co2 < 0) {
    res.status(400);
    throw new Error('Calculated CO2 must be non-negative');
  }

  // Verify department exists
  const deptExists = await Department.findById(department);
  if (!deptExists) {
    res.status(400);
    throw new Error('Department not found');
  }

  // Verify emission factor exists
  const factorExists = await EmissionFactor.findById(emission_factor);
  if (!factorExists) {
    res.status(400);
    throw new Error('Emission factor not found');
  }

  // Check if carbon transaction already exists for this source
  const existingTransaction = await CarbonTransaction.findOne({
    source_type,
    source_record_id
  });

  if (existingTransaction) {
    res.status(400);
    throw new Error('Carbon transaction already exists for this source record');
  }

  const carbonTransaction = await CarbonTransaction.create({
    department,
    source_type,
    source_record_id,
    emission_factor,
    calculated_co2,
    date: date || new Date(),
    is_auto_calculated: false // Manual entry
  });

  if (carbonTransaction) {
    res.status(201).json(carbonTransaction);
  } else {
    res.status(400);
    throw new Error('Invalid carbon transaction data');
  }
});

// @desc    Calculate CO2 emissions from source records (auto calculation)
// @route   POST /api/carbon-transactions/calculate-from-source
// @access  Private/Admin
const calculateEmissionFromSourceController = asyncHandler(async (req, res) => {
  const { source_type, source_id } = req.body;

  // Validate required fields
  if (!source_type || !source_id) {
    res.status(400);
    throw new Error('Please provide source_type and source_id');
  }

  // Validate source_type
  const validSourceTypes = ['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET'];
  if (!validSourceTypes.includes(source_type)) {
    res.status(400);
    throw new Error('Source type must be one of: PURCHASE, MANUFACTURING, EXPENSE, FLEET');
  }

  try {
    const result = await AutoEmissionService.calculateEmissionFromSource(source_type, source_id);

    if (result.success) {
      res.status(201).json({
        message: 'CO2 emissions calculated and carbon transaction created successfully',
        calculatedCO2: result.calculatedCO2,
        transaction: result.transaction
      });
    } else {
      res.status(400).json({
        message: result.message,
        transaction: result.transaction
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Update a carbon transaction
// @route   PUT /api/carbon-transactions/:id
// @access  Private
const updateCarbonTransaction = asyncHandler(async (req, res) => {
  const transaction = await CarbonTransaction.findById(req.params.id);

  if (transaction) {
    // Prevent updating auto-calculated transactions manually unless overriding
    if (transaction.is_auto_calculated && req.body.is_auto_calculated !== false) {
      res.status(400);
      throw new Error('Cannot modify auto-calculated transaction without explicitly setting is_auto_calculated to false');
    }

    transaction.department = req.body.department || transaction.department;
    transaction.source_type = req.body.source_type || transaction.source_type;
    transaction.source_record_id = req.body.source_record_id || transaction.source_record_id;
    transaction.emission_factor = req.body.emission_factor || transaction.emission_factor;
    if (req.body.calculated_co2 !== undefined) {
      // Validate calculated_co2 is non-negative
      if (req.body.calculated_co2 < 0) {
        res.status(400);
        throw new Error('Calculated CO2 must be non-negative');
      }
      transaction.calculated_co2 = req.body.calculated_co2;
    }
    if (req.body.date !== undefined) {
      transaction.date = req.body.date;
    }
    // Only allow changing is_auto_calculated from true to false, not vice versa
    if (req.body.is_auto_calculated === false && transaction.is_auto_calculated === true) {
      transaction.is_auto_calculated = false;
    }

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } else {
    res.status(404);
    throw new Error('Carbon transaction not found');
  }
});

// @desc    Delete a carbon transaction
// @route   DELETE /api/carbon-transactions/:id
// @access  Private
const deleteCarbonTransaction = asyncHandler(async (req, res) => {
  const transaction = await CarbonTransaction.findById(req.params.id);

  if (transaction) {
    await transaction.remove();
    res.json({ message: 'Carbon transaction removed' });
  } else {
    res.status(404);
    throw new Error('Carbon transaction not found');
  }
});

// @desc    Calculate emissions for all unprocessed source records
// @route   POST /api/carbon-transactions/process-all
// @access  Private/Admin
const processAllSourceRecordsController = asyncHandler(async (req, res) => {
  try {
    const result = await AutoEmissionService.processAllSourceRecords();
    res.json(result);
  } catch (error) {
    res.status(500);
    throw new Error('Error processing source records');
  }
});

export {
  getCarbonTransactions,
  getCarbonTransactionById,
  createCarbonTransaction,
  calculateEmissionFromSourceController as calculateEmissionFromSource,
  updateCarbonTransaction,
  deleteCarbonTransaction,
  processAllSourceRecordsController as processAllSourceRecords
};
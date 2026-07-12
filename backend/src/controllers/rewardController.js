import asyncHandler from 'express-async-handler';
import Reward from '../models/Reward.js';
import RewardRedemption from '../models/RewardRedemption.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc    Get all rewards
// @route   GET /api/rewards
// @access  Private
const getRewards = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  // Build filter
  const filter = {};
  if (status) filter.status = status;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [rewards, total] = await Promise.all([
    Reward.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Reward.countDocuments(filter)
  ]);

  res.json({
    rewards,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get a single reward
// @route   GET /api/rewards/:id
// @access  Private
const getRewardById = asyncHandler(async (req, res) => {
  const reward = await Reward.findById(req.params.id);

  if (reward) {
    res.json(reward);
  } else {
    res.status(404);
    throw new Error('Reward not found');
  }
});

// @desc    Create a new reward
// @route   POST /api/rewards
// @access  Private/Admin
const createReward = asyncHandler(async (req, res) => {
  const { name, description, points_required, stock } = req.body;

  // Validate required fields
  if (!name || !description || typeof points_required !== 'number' || typeof stock !== 'number') {
    res.status(400);
    throw new Error('Please provide name, description, points_required, and stock');
  }

  // Validate points_required and stock are non-negative
  if (points_required < 0) {
    res.status(400);
    throw new Error('Points required must be non-negative');
  }
  if (stock < 0) {
    res.status(400);
    throw new Error('Stock must be non-negative');
  }

  const reward = await Reward.create({
    name,
    description,
    points_required,
    stock,
    status: stock > 0 ? 'active' : 'out_of_stock'
  });

  if (reward) {
    res.status(201).json(reward);
  } else {
    res.status(400);
    throw new Error('Invalid reward data');
  }
});

// @desc    Update a reward
// @route   PUT /api/rewards/:id
// @access  Private/Admin
const updateReward = asyncHandler(async (req, res) => {
  const reward = await Reward.findById(req.params.id);

  if (reward) {
    reward.name = req.body.name || reward.name;
    reward.description = req.body.description || reward.description;
    if (req.body.points_required !== undefined) {
      if (req.body.points_required < 0) {
        res.status(400);
        throw new Error('Points required must be non-negative');
      }
      reward.points_required = req.body.points_required;
    }
    if (req.body.stock !== undefined) {
      if (req.body.stock < 0) {
        res.status(400);
        throw new Error('Stock must be non-negative');
      }
      reward.stock = req.body.stock;
      // Update status based on stock
      reward.status = reward.stock > 0 ? 'active' : 'out_of_stock';
    }

    const updatedReward = await reward.save();
    res.json(updatedReward);
  } else {
    res.status(404);
    throw new Error('Reward not found');
  }
});

// @desc    Delete a reward
// @route   DELETE /api/rewards/:id
// @access  Private/Admin
const deleteReward = asyncHandler(async (req, res) => {
  const reward = await Reward.findById(req.params.id);

  if (reward) {
    // Check if reward has been redeemed
    const redemptionCount = await RewardRedemption.countDocuments({ reward: reward._id });

    if (redemptionCount > 0) {
      res.status(400);
      throw new Error('Cannot delete reward that has been redeemed');
    }

    await reward.remove();
    res.json({ message: 'Reward removed' });
  } else {
    res.status(404);
    throw new Error('Reward not found');
  }
});

// @desc    Redeem a reward
// @route   POST /api/rewards/:id/redeem
// @access  Private
const redeemReward = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId } = req.body;
    const rewardId = req.params.id;

    if (!userId) {
      res.status(400);
      throw new Error('Please provide userId');
    }

    // Find the user and reward
    const [user, reward] = await Promise.all([
      User.findById(userId).session(session),
      Reward.findById(rewardId).session(session)
    ]);

    // Validate user exists
    if (!user) {
      res.status(400);
      throw new Error('User not found');
    }

    // Validate reward exists
    if (!reward) {
      res.status(400);
      throw new Error('Reward not found');
    }

    // Check if reward is available
    if (!reward.isAvailable) {
      res.status(400);
      throw new Error('Reward is not available for redemption');
    }

    // Check if user has enough points
    if (user.points_balance < reward.points_required) {
      res.status(400);
      throw new Error('Insufficient points for redemption');
    }

    // Check if reward has stock
    if (reward.stock <= 0) {
      res.status(400);
      throw new Error('Reward is out of stock');
    }

    // Create the redemption record
    const redemption = await RewardRedemption.create([{
      user: userId,
      reward: rewardId,
      points_spent: reward.points_required
    }], { session });

    // Update user's points balance
    user.points_balance -= reward.points_required;
    await user.save({ session });

    // Update reward stock
    reward.stock -= 1;
    // Update status if out of stock
    if (reward.stock === 0) {
      reward.status = 'out_of_stock';
    }
    await reward.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Populate references for response
    await redemption[0].populate([
      { path: 'user', select: 'name email' },
      { path: 'reward', select: 'name description points_required' }
    ]);

    res.status(201).json({
      success: true,
      redemption: redemption[0],
      message: 'Reward redeemed successfully',
      remainingPoints: user.points_balance
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error('Error redeeming reward:', error);
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get user's redemption history
// @route   GET /api/users/:userId/rewards/redemptions
// @access  Private
const getUserRedemptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  // Verify user exists
  const userExists = await User.findById(req.params.userId);
  if (!userExists) {
    res.status(404);
    throw new Error('User not found');
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [redemptions, total] = await Promise.all([
    RewardRedemption.find({ user: req.params.userId })
      .sort({ redeemed_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'reward',
        select: 'name description points_required'
      }),
    RewardRedemption.countDocuments({ user: req.params.userId })
  ]);

  res.json({
    redemptions,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Restock a reward (admin function)
// @route   POST /api/rewards/:id/restock
// @access  Private/Admin
const restockReward = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    res.status(400);
    throw new Error('Please provide a positive amount for restocking');
  }

  const reward = await Reward.findByIdAndUpdate(
    req.params.id,
    {
      $inc: { stock: amount },
      $set: {
        status: 'active' // If we're adding stock, it should be active
      }
    },
    { new: true }
  );

  if (!reward) {
    res.status(404);
    throw new Error('Reward not found');
  }

  res.json(reward);
});

// @desc    Get reward statistics
// @route   GET /api/reports/rewards-stats
// @access  Private/Admin
const getRewardStatistics = asyncHandler(async (req, res) => {
  try {
    const [totalRewards, activeRewards, outOfStockRedemptions, totalRedemptions] = await Promise.all([
      Reward.countDocuments({}),
      Reward.countDocuments({ status: 'active' }),
      Reward.countDocuments({ stock: 0 }),
      RewardRedemption.countDocuments({})
    ]);

    const redemptionRate = totalRewards > 0 ? (totalRedemptions / totalRewards) * 100 : 0;

    res.json({
      totalRewards,
      activeRewards,
      outOfStockRedemptions,
      totalRedemptions,
      redemptionRate: parseFloat(redemptionRate.toFixed(2))
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error retrieving reward statistics');
  }
});

export {
  getRewards,
  getRewardById,
  createReward,
  updateReward,
  deleteReward,
  redeemReward,
  getUserRedemptions,
  restockReward,
  getRewardStatistics
};
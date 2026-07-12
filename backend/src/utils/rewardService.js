import { startSession } from 'mongoose';
import User from '../models/User.js';
import Reward from '../models/Reward.js';
import RewardRedemption from '../models/RewardRedemption.js';
import NotificationService from './notificationService.js';

class RewardService {

  static async redeemReward(userId, rewardId) {
    const session = await startSession();
    session.startTransaction();

    try {
      // Find the user and reward
      const [user, reward] = await Promise.all([
        User.findById(userId).session(session),
        Reward.findById(rewardId).session(session)
      ]);

      // Validate user exists
      if (!user) {
        throw new Error('User not found');
      }

      // Validate reward exists
      if (!reward) {
        throw new Error('Reward not found');
      }

      // Check if reward is available
      if (!reward.isAvailable) {
        throw new Error('Reward is not available for redemption');
      }

      // Check if user has enough points
      if (user.points_balance < reward.points_required) {
        throw new Error('Insufficient points for redemption');
      }

      // Check if reward has stock
      if (reward.stock <= 0) {
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

      return {
        success: true,
        redemption: redemption[0],
        message: 'Reward redeemed successfully',
        remainingPoints: user.points_balance
      };
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      console.error('Error redeeming reward:', error);
      throw error;
    }
  }

  /**
   * Get redemption history for a user
   * @param {string} userId - User ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Redemption history
   */
  static async getUserRedemptions(userId, options = {}) {
    try {
      const { limit = 10, skip = 0 } = options;

      const redemptions = await RewardRedemption.find({ user: userId })
        .sort({ redeemed_at: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'reward',
          select: 'name description points_required'
        });

      const total = await RewardRedemption.countDocuments({ user: userId });

      return {
        redemptions,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total
        }
      };
    } catch (error) {
      console.error('Error getting user redemptions:', error);
      throw error;
    }
  }

  /**
   * Get all redemptions (admin function)
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Object>} All redemptions
   */
  static async getAllRedemptions(options = {}) {
    try {
      const {
        limit = 10,
        skip = 0,
        userId,
        rewardId,
        startDate,
        endDate
      } = options;

      // Build query
      const query = {};

      if (userId) query.user = userId;
      if (rewardId) query.reward = rewardId;
      if (startDate || endDate) {
        query.redeemed_at = {};
        if (startDate) query.redeemed_at.$gte = new Date(startDate);
        if (endDate) query.redeemed_at.$lte = new Date(endDate);
      }

      const redemptions = await RewardRedemption.find(query)
        .sort({ redeemed_at: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'user',
          select: 'name email'
        })
        .populate({
          path: 'reward',
          select: 'name description points_required'
        });

      const total = await RewardRedemption.countDocuments(query);

      return {
        redemptions,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total
        }
      };
    } catch (error) {
      console.error('Error getting all redemptions:', error);
      throw error;
    }
  }

  /**
   * Restock a reward (admin function)
   * @param {string} rewardId - Reward ID
   * @param {number} amount - Amount to add to stock
   * @returns {Promise<Object>} Updated reward
   */
  static async restockReward(rewardId, amount) {
    try {
      if (amount <= 0) {
        throw new Error('Restock amount must be positive');
      }

      const reward = await Reward.findByIdAndUpdate(
        rewardId,
        {
          $inc: { stock: amount },
          $set: {
            status: amount > 0 ? 'active' : reward.status
          }
        },
        { new: true }
      );

      if (!reward) {
        throw new Error('Reward not found');
      }

      return reward;
    } catch (error) {
      console.error('Error restocking reward:', error);
      throw error;
    }
  }

  /**
   * Get reward statistics
   * @returns {Promise<Object>} Reward statistics
   */
  static async getRewardStatistics() {
    try {
      const [totalRewards, activeRewards, outOfStockRedemptions, totalRedemptions] = await Promise.all([
        Reward.countDocuments({}),
        Reward.countDocuments({ status: 'active' }),
        Reward.countDocuments({ stock: 0 }),
        RewardRedemption.countDocuments({})
      ]);

      const redemptionRate = totalRewards > 0 ? (totalRedemptions / totalRewards) * 100 : 0;

      return {
        totalRewards,
        activeRewards,
        outOfStockRedemptions,
        totalRedemptions,
        redemptionRate: parseFloat(redemptionRate.toFixed(2))
      };
    } catch (error) {
      console.error('Error getting reward statistics:', error);
      throw error;
    }
  }
}

export default RewardService;
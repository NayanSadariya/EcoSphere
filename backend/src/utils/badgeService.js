import mongoose from 'mongoose';
import User from '../models/User.js';
import Badge from '../models/Badge.js';
import EmployeeBadge from '../models/EmployeeBadge.js';
import ChallengeParticipation from '../models/ChallengeParticipation.js';
import EmployeeParticipation from '../models/EmployeeParticipation.js';
import NotificationService from './notificationService.js';
import Settings from '../models/Settings.js';

class BadgeService {
  /**
   * Check if badge auto-award is enabled
   * @returns {Promise<boolean>} Whether auto-award is enabled
   */
  static async isEnabled() {
    try {
      const settings = await Settings.findOne({});
      return settings ? settings.badge_auto_award_enabled : true; // Default to true
    } catch (error) {
      console.error('Error checking badge auto-award setting:', error);
      return true; // Default to true on error
    }
  }

  /**
   * Check if a user has already earned a specific badge
   * @param {string} userId - User ID
   * @param {string} badgeId - Badge ID
   * @returns {Promise<boolean>} Whether the user has the badge
   */
  static async hasBadge(userId, badgeId) {
    try {
      const existingBadge = await EmployeeBadge.findOne({
        employee: userId,
        badge: badgeId
      });
      return !!existingBadge;
    } catch (error) {
      console.error('Error checking if user has badge:', error);
      return false;
    }
  }

  /**
   * Award a badge to a user
   * @param {string} userId - User ID
   * @param {string} badgeId - Badge ID
   * @returns {Promise<Object>} The awarded badge record
   */
  static async awardBadge(userId, badgeId) {
    try {
      // Check if auto-award is enabled
      const enabled = await this.isEnabled();
      if (!enabled) {
        throw new Error('Badge auto-award is disabled');
      }

      // Check if user already has this badge
      const alreadyHasBadge = await this.hasBadge(userId, badgeId);
      if (alreadyHasBadge) {
        return null; // Already has the badge
      }

      // Get the badge details
      const badge = await Badge.findById(badgeId);
      if (!badge) {
        throw new Error('Badge not found');
      }

      // Create the badge award
      const employeeBadge = await EmployeeBadge.create({
        employee: userId,
        badge: badgeId
      });

      // Send notification if enabled
      await NotificationService.notifyBadgeUnlock(userId, badge);

      // Populate references for return value
      await employeeBadge.populate([
        { path: 'employee', select: 'name email' },
        { path: 'badge', select: 'name description icon_url' }
      ]);

      return employeeBadge;
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  }

  /**
   * Check and award badges based on XP thresholds
   * @param {string} userId - User ID
   * @param {number} newXP - The user's new total XP
   * @returns {Promise<Array>} Array of newly awarded badges
   */
  static async checkAndAwardXPBadges(userId, newXP) {
    try {
      // Check if auto-award is enabled
      const enabled = await this.isEnabled();
      if (!enabled) {
        return [];
      }

      // Get all XP-based badges
      const xpBadges = await Badge.find({
        'unlock_rule.type': 'xp_gte'
      });

      const awardedBadges = [];

      for (const badge of xpBadges) {
        const requiredXP = badge.unlock_rule.value;

        // Check if user has enough XP and doesn't already have the badge
        if (newXP >= requiredXP) {
          const hasBadge = await this.hasBadge(userId, badge._id);
          if (!hasBadge) {
            const awardedBadge = await this.awardBadge(userId, badge._id);
            if (awardedBadge) {
              awardedBadges.push(awardedBadge);
            }
          }
        }
      }

      return awardedBadges;
    } catch (error) {
      console.error('Error checking and awarding XP badges:', error);
      throw error;
    }
  }

  /**
   * Check and award badges based on completed challenges
   * @param {string} userId - User ID
   * @param {number} completedChallenges - Number of completed challenges
   * @returns {Promise<Array>} Array of newly awarded badges
   */
  static async checkAndAwardChallengeBadges(userId, completedChallenges) {
    try {
      // Check if auto-award is enabled
      const enabled = await this.isEnabled();
      if (!enabled) {
        return [];
      }

      // Get all challenge-based badges
      const challengeBadges = await Badge.find({
        'unlock_rule.type': 'challenges_completed_gte'
      });

      const awardedBadges = [];

      for (const badge of challengeBadges) {
        const requiredChallenges = badge.unlock_rule.value;

        // Check if user has completed enough challenges and doesn't already have the badge
        if (completedChallenges >= requiredChallenges) {
          const hasBadge = await this.hasBadge(userId, badge._id);
          if (!hasBadge) {
            const awardedBadge = await this.awardBadge(userId, badge._id);
            if (awardedBadge) {
              awardedBadges.push(awardedBadge);
            }
          }
        }
      }

      return awardedBadges;
    } catch (error) {
      console.error('Error checking and awarding challenge badges:', error);
      throw error;
    }
  }

  /**
   * Check and award badges based on points balance
   * @param {string} userId - User ID
   * @param {number} pointsBalance - User's current points balance
   * @returns {Promise<Array>} Array of newly awarded badges
   */
  static async checkAndAwardPointsBadges(userId, pointsBalance) {
    try {
      // Check if auto-award is enabled
      const enabled = await this.isEnabled();
      if (!enabled) {
        return [];
      }

      // Get all points-based badges
      const pointsBadges = await Badge.find({
        'unlock_rule.type': 'points_balance_gte'
      });

      const awardedBadges = [];

      for (const badge of pointsBadges) {
        const requiredPoints = badge.unlock_rule.value;

        // Check if user has enough points and doesn't already have the badge
        if (pointsBalance >= requiredPoints) {
          const hasBadge = await this.hasBadge(userId, badge._id);
          if (!hasBadge) {
            const awardedBadge = await this.awardBadge(userId, badge._id);
            if (awardedBadge) {
              awardedBadges.push(awardedBadge);
            }
          }
        }
      }

      return awardedBadges;
    } catch (error) {
      console.error('Error checking and awarding points badges:', error);
      throw error;
    }
  }

  /**
   * Main function to check and award all applicable badges for a user
   * Should be called after XP-changing operations
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result with awarded badges
   */
  static async checkAndAwardUserBadges(userId) {
    try {
      // Get user's current stats
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Count completed challenges for this user
      const completedChallengesCount = await ChallengeParticipation.countDocuments({
        employee: userId,
        approval_status: 'APPROVED'
      });

      // Check and award badges based on different criteria
      const xpBadges = await this.checkAndAwardXPBadges(userId, user.xp_total);
      const challengeBadges = await this.checkAndAwardChallengeBadges(userId, completedChallengesCount);
      const pointsBadges = await this.checkAndAwardPointsBadges(userId, user.points_balance);

      // Combine all awarded badges
      const allAwardedBadges = [
        ...xpBadges,
        ...challengeBadges,
        ...pointsBadges
      ];

      return {
        userId,
        xpTotal: user.xp_total,
        pointsBalance: user.points_balance,
        completedChallenges: completedChallengesCount,
        awardedBadges: allAwardedBadges,
        count: allAwardedBadges.length
      };
    } catch (error) {
      console.error('Error checking and awarding user badges:', error);
      throw error;
    }
  }

  /**
   * Get all badges earned by a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of earned badges with details
   */
  static async getUserBadges(userId) {
    try {
      const userBadges = await EmployeeBadge.find({ employee: userId })
        .sort({ earned_at: -1 })
        .populate({
          path: 'badge',
          select: 'name description icon_url unlock_rule'
        })
        .populate({
          path: 'employee',
          select: 'name email'
        });

      return userBadges;
    } catch (error) {
      console.error('Error getting user badges:', error);
      throw error;
    }
  }

  /**
   * Get progress toward a specific badge for a user
   * @param {string} userId - User ID
   * @param {string} badgeId - Badge ID
   * @returns {Promise<Object>} Progress information
   */
  static async getBadgeProgress(userId, badgeId) {
    try {
      const badge = await Badge.findById(badgeId);
      if (!badge) {
        throw new Error('Badge not found');
      }

      const hasBadge = await this.hasBadge(userId, badgeId);
      if (hasBadge) {
        return {
          badgeId: badge._id,
          badgeName: badge.name,
          earned: true,
          progress: 100
        };
      }

      let progress = 0;
      let currentValue = 0;
      let requiredValue = badge.unlock_rule.value;

      switch (badge.unlock_rule.type) {
        case 'xp_gte':
          const user = await User.findById(userId);
          currentValue = user ? user.xp_total : 0;
          progress = Math.min(100, (currentValue / requiredValue) * 100);
          break;

        case 'challenges_completed_gte':
          const completedChallenges = await ChallengeParticipation.countDocuments({
            employee: userId,
            approval_status: 'APPROVED'
          });
          currentValue = completedChallenges;
          progress = Math.min(100, (currentValue / requiredValue) * 100);
          break;

        case 'points_balance_gte':
          const user2 = await User.findById(userId);
          currentValue = user2 ? user2.points_balance : 0;
          progress = Math.min(100, (currentValue / requiredValue) * 100);
          break;

        default:
          progress = 0;
      }

      return {
        badgeId: badge._id,
        badgeName: badge.name,
        earned: false,
        progress: parseFloat(progress.toFixed(2)),
        currentValue,
        requiredValue,
        type: badge.unlock_rule.type
      };
    } catch (error) {
      console.error('Error getting badge progress:', error);
      throw error;
    }
  }

  /**
   * Get all badges with user's progress toward each
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of badges with progress
   */
  static async getAllBadgesWithProgress(userId) {
    try {
      const badges = await Badge.find({});
      const progressPromises = badges.map(badge => this.getBadgeProgress(userId, badge._id));
      const progressArray = await Promise.all(progressPromises);

      return progressArray;
    } catch (error) {
      console.error('Error getting all badges with progress:', error);
      throw error;
    }
  }
}

export default BadgeService;
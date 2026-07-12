import Notification from '../models/Notification.js';
import User from '../models/User.js';

class NotificationService {
  
  static async createNotification(notificationData) {
    try {
      const notification = await Notification.create(notificationData);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options (limit, skip, etc.)
   * @returns {Promise<Array>} Array of notifications
   */
  static async getUserNotifications(userId, options = {}) {
    try {
      const { limit = 50, skip = 0, unreadOnly = false } = options;

      let query = { recipient: userId };

      if (unreadOnly) {
        query.is_read = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('recipient', 'name email');

      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<Object>} Updated notification
   */
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { is_read: true },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found or unauthorized');
      }

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, is_read: false },
        { is_read: true }
      );

      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get count of unread notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Count of unread notifications
   */
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipient: userId,
        is_read: false
      });

      return count;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.deleteOne({
        _id: notificationId,
        recipient: userId
      });

      if (result.deletedCount === 0) {
        throw new Error('Notification not found or unauthorized');
      }

      return result;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Check if notification settings allow a specific type
   * @param {string} userId - User ID
   * @param {string} notificationType - Type of notification
   * @returns {Promise<boolean>} Whether notifications of this type are enabled
   */
  static async isNotificationEnabled(userId, notificationType) {
    try {
      // In a real app, we would check user-specific settings
      // For now, we'll use global settings
      const Settings = require('../models/Settings');
      const settings = await Settings.findOne({});

      if (!settings || !settings.notification_settings) {
        // Default to enabled if no settings found
        return true;
      }

      return settings.notification_settings[notificationType] !== false;
    } catch (error) {
      console.error('Error checking notification settings:', error);
      // Default to enabled on error
      return true;
    }
  }

  /**
   * Send notification if enabled
   * @param {Object} notificationData - Data for the notification
   * @param {string} userId - User ID to check preferences for
   * @returns {Promise<Object|null>} Created notification or null if not sent
   */
  static async sendNotificationIfEnabled(notificationData, userId) {
    try {
      const { type } = notificationData;

      // Check if notifications of this type are enabled
      const enabled = await this.isNotificationEnabled(userId, type);

      if (!enabled) {
        return null; // Don't send notification
      }

      // Create and return the notification
      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Trigger notification for new compliance issue
   * @param {Object} complianceIssue - The compliance issue document
   */
  static async notifyNewComplianceIssue(complianceIssue) {
    try {
      // Get managers and admins in the department
      const recipients = await User.find({
        department: complianceIssue.audit.department,
        role: { $in: ['admin', 'manager'] }
      }).select('_id');

      const notificationPromises = recipients.map(async (user) => {
        return this.createNotification({
          recipient: user._id,
          type: 'new_compliance_issue',
          message: `New compliance issue reported: ${complianceIssue.description.substring(0, 100)}...`
        });
      });

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error sending new compliance issue notification:', error);
    }
  }

  /**
   * Trigger notification for CSR participation approval/rejection
   * @param {Object} participation - The employee participation document
   * @param {boolean} isApproved - Whether it was approved or rejected
   */
  static async notifyCSRParticipationDecision(participation, isApproved) {
    try {
      const type = isApproved ? 'csr_participation_approved' : 'csr_participation_rejected';
      const status = isApproved ? 'approved' : 'rejected';

      return await this.createNotification({
        recipient: participation.employee,
        type: type,
        message: `Your CSR participation for "${participation.activityDetails.title}" has been ${status}.`
      });
    } catch (error) {
      console.error('Error sending CSR participation decision notification:', error);
    }
  }

  /**
   * Trigger notification for challenge participation approval/rejection
   * @param {Object} participation - The challenge participation document
   * @param {boolean} isApproved - Whether it was approved or rejected
   */
  static async notifyChallengeParticipationDecision(participation, isApproved) {
    try {
      const type = isApproved ? 'challenge_participation_approved' : 'challenge_participation_rejected';
      const status = isApproved ? 'approved' : 'rejected';

      return await this.createNotification({
        recipient: participation.employee,
        type: type,
        message: `Your challenge participation for "${participation.challengeDetails.title}" has been ${status}.`
      });
    } catch (error) {
      console.error('Error sending challenge participation decision notification:', error);
    }
  }

  /**
   * Trigger notification for policy acknowledgement reminder
   * @param {string} userId - User ID to remind
   * @param {Object} policy - The policy document
   */
  static async notifyPolicyAcknowledgementReminder(userId, policy) {
    try {
      return await this.createNotification({
        recipient: userId,
        type: 'policy_acknowledgement_reminder',
        message: `Please acknowledge the policy: "${policy.title}"`
      });
    } catch (error) {
      console.error('Error sending policy acknowledgement reminder notification:', error);
    }
  }

  /**
   * Trigger notification for badge unlock
   * @param {string} userId - User ID who earned the badge
   * @param {Object} badge - The badge document
   */
  static async notifyBadgeUnlock(userId, badge) {
    try {
      return await this.createNotification({
        recipient: userId,
        type: 'badge_unlocked',
        message: `Congratulations! You've earned the badge: "${badge.name}"`
      });
    } catch (error) {
      console.error('Error sending badge unlock notification:', error);
    }
  }

  /**
   * Trigger notification for overdue compliance issue
   * @param {Object} complianceIssue - The overdue compliance issue document
   */
  static async notifyOverdueComplianceIssue(complianceIssue) {
    try {
      // Notify the owner and their manager
      const recipients = new Set();
      recipients.add(complianceIssue.owner);

      // Get the owner's manager (if any)
      const owner = await User.findById(complianceIssue.owner);
      if (owner && owner.manager) {
        recipients.add(owner.manager);
      }

      const notificationPromises = Array.from(recipients).map(async (userId) => {
        return this.createNotification({
          recipient: userId,
          type: 'compliance_issue_overdue',
          message: `Overdue compliance issue: "${complianceIssue.description}" is past due date.`
        });
      });

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error sending overdue compliance issue notification:', error);
    }
  }

  /**
   * Check for overdue compliance issues and send notifications
   * This should be run periodically (e.g., daily)
   */
  static async checkAndNotifyOverdueIssues() {
    try {
      const now = new Date();

      const overdueIssues = await this.findOverdueIssues();

      const notificationPromises = overdueIssues.map(async (issue) => {
        return this.notifyOverdueComplianceIssue(issue);
      });

      await Promise.all(notificationPromises);

      return overdueIssues.length;
    } catch (error) {
      console.error('Error checking and notifying overdue issues:', error);
      throw error;
    }
  }

  // Helper methods
  static async findOverdueIssues() {
    return await this.findMany('ComplianceIssue', {
      status: { $ne: 'RESOLVED' },
      due_date: { $lt: new Date() }
    });
  }

  static async findMany(modelName, query) {
    const Model = require(`../models/${modelName}`);
    return Model.find(query);
  }
}

export default NotificationService;
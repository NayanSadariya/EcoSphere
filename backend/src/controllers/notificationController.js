import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Get notifications for the current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { limit = 20, skip = 0, unreadOnly = false } = req.query;

  // Build filter
  const filter = { recipient: req.user.id };

  if (unreadOnly === 'true') {
    filter.is_read = false;
  }

  // Get notifications with pagination
  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('recipient', 'name email'),
    Notification.countDocuments(filter)
  ]);

  res.json({
    notifications,
    pagination: {
      total,
      page: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get number of unread notifications
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user.id,
    is_read: false
  });

  res.json({ count });
});

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { is_read: true },
    { new: true }
  );

  if (notification) {
    res.json(notification);
  } else {
    res.status(404);
    throw new Error('Notification not found or unauthorized');
  }
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user.id, is_read: false },
    { is_read: true }
  );

  res.json({
    message: `${result.nModified} notifications marked as read`,
    modifiedCount: result.nModified
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id
  });

  if (notification) {
    res.json({ message: 'Notification deleted' });
  } else {
    res.status(404);
    throw new Error('Notification not found or unauthorized');
  }
});

// @desc    Get all notifications (admin function)
// @route   GET /api/notifications/all
// @access  Private/Admin
const getAllNotifications = asyncHandler(async (req, res) => {
  const { recipient, type, is_read, page = 1, limit = 50 } = req.query;

  // Build filter
  const filter = {};

  if (recipient) filter.recipient = recipient;
  if (type) filter.type = type;
  if (is_read !== undefined) filter.is_read = is_read === 'true';

  // Get notifications with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('recipient', 'name email'),
    Notification.countDocuments(filter)
  ]);

  res.json({
    notifications,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

export {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getAllNotifications
};
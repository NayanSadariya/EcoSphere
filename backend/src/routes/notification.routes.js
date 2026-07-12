import { Router } from 'express';
const router = Router();
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, getAllNotifications } from '../controllers/notificationController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// User routes
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

// Admin routes
router.get('/all', authorizeAdmin, getAllNotifications);

export default router;
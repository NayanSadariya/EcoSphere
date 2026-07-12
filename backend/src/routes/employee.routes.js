import { Router } from 'express';
const router = Router();
import { getEmployees, getEmployeeById, updateEmployee, deleteEmployee, getUserBadges, getUserProfile } from '../controllers/employeeController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes (with filtering)
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);

// Admin routes
router.put('/:id', authorizeAdmin, updateEmployee);
router.delete('/:id', authorizeAdmin, deleteEmployee);

// User-specific routes
router.get('/:id/badges', getUserBadges);
router.get('/:id/profile', getUserProfile);

export default router;
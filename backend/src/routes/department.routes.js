import { Router } from 'express';
const router = Router();
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment, getDepartmentScore } from '../controllers/departmentController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

// Admin routes
router.post('/', authorizeAdmin, createDepartment);
router.put('/:id', authorizeAdmin, updateDepartment);
router.delete('/:id', authorizeAdmin, deleteDepartment);

// Score route
router.get('/:id/score', getDepartmentScore);

export default router;
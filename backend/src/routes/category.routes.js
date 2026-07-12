import { Router } from 'express';
const router = Router();
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, activateCategory, deactivateCategory } from '../controllers/categoryController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', authorizeAdmin, createCategory);
router.put('/:id', authorizeAdmin, updateCategory);
router.delete('/:id', authorizeAdmin, deleteCategory);

// Status change routes
router.put('/:id/activate', authorizeAdmin, activateCategory);
router.put('/:id/deactivate', authorizeAdmin, deactivateCategory);

export default router;
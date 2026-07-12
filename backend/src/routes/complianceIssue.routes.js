import { Router } from 'express';
const router = Router();
import { getComplianceIssues, getComplianceIssueById, createComplianceIssue, updateComplianceIssue, deleteComplianceIssue, getOverdueIssues, checkAndNotifyOverdueIssues, getComplianceStatistics } from '../controllers/complianceIssueController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes
router.get('/', getComplianceIssues);
router.get('/:id', getComplianceIssueById);
router.get('/overdue', getOverdueIssues);

// Admin routes
router.post('/', authorizeAdmin, createComplianceIssue);
router.put('/:id', authorizeAdmin, updateComplianceIssue);
router.delete('/:id', authorizeAdmin, deleteComplianceIssue);

// Special admin routes
router.post('/check-overdue', authorizeAdmin, checkAndNotifyOverdueIssues);
router.get('/stats', authorizeAdmin, getComplianceStatistics);

export default router;
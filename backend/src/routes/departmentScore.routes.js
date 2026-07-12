import { Router } from 'express';
const router = Router();
import { getDepartmentScores, getDepartmentScoreById, getDepartmentScoreByDeptId, calculateDepartmentScore, calculateAllDepartmentScores, getOrganizationalESGScore, calculateOrganizationalESGScore } from '../controllers/departmentScoreController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes
router.get('/', getDepartmentScores);
router.get('/:id', getDepartmentScoreById);

// Department-specific score route
router.get('/departments/:departmentId/score', getDepartmentScoreByDeptId);

// Calculation routes (admin)
router.post('/:id/calculate', authorizeAdmin, calculateDepartmentScore);
router.post('/calculate-all', authorizeAdmin, calculateAllDepartmentScores);

// Organizational score routes
router.get('/org/esg-score', getOrganizationalESGScore);
router.post('/org/esg-score/calculate', authorizeAdmin, calculateOrganizationalESGScore);

export default router;
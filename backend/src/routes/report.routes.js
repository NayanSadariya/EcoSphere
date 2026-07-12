import { Router } from 'express';
const router = Router();
import { getEnvironmentalReport, getSocialReport, getGovernanceReport, getESGSummaryReport, getCustomReport } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Report routes
router.get('/environmental', getEnvironmentalReport);
router.get('/social', getSocialReport);
router.get('/governance', getGovernanceReport);
router.get('/esg-summary', getESGSummaryReport);
router.post('/custom', getCustomReport);

export default router;
import { Router } from 'express';
const router = Router();
import { getAudits, getAuditById, createAudit, updateAudit, deleteAudit, startAudit, completeAudit, cancelAudit } from '../controllers/auditController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes
router.get('/', getAudits);
router.get('/:id', getAuditById);

// Admin routes
router.post('/', authorizeAdmin, createAudit);
router.put('/:id', authorizeAdmin, updateAudit);
router.delete('/:id', authorizeAdmin, deleteAudit);

// Status change routes
router.patch('/:id/start', authorizeAdmin, startAudit);
router.patch('/:id/complete', authorizeAdmin, completeAudit);
router.patch('/:id/cancel', authorizeAdmin, cancelAudit);

export default router;
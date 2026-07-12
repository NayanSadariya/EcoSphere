import { Router } from 'express';
const router = Router();
import { getPolicies, getPolicyById, createPolicy, updatePolicy, deletePolicy, acknowledgePolicy, getPolicyAcknowledgements, getUserPolicyAcknowledgement, getUnacknowledgedPolicies } from '../controllers/policyController.js';
import { protect } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes
router.get('/', getPolicies);
router.get('/:id', getPolicyById);

// Admin routes
router.post('/', protect, createPolicy);
router.put('/:id', protect, updatePolicy);
router.delete('/:id', protect, deletePolicy);

// User interaction routes
router.post('/:id/acknowledge', protect, acknowledgePolicy);
router.get('/:id/acknowledgements', protect, getPolicyAcknowledgements);
router.get('/users/:userId/policies/:policyId/acknowledgement', protect, getUserPolicyAcknowledgement);
router.get('/users/:userId/policies/unacknowledged', protect, getUnacknowledgedPolicies);

export default router;
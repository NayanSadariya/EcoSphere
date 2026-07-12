import { Router } from 'express';
const router = Router();
import { getEmployeeParticipations, getEmployeeParticipationsByEmployee, getEmployeeParticipationsByActivity, createEmployeeParticipation, updateParticipationStatus, getParticipationByEmployeeAndActivity } from '../controllers/employeeParticipationController.js';
import { protect } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Read routes
router.get('/', getEmployeeParticipations);
router.get('/employee/:employeeId', getEmployeeParticipationsByEmployee);
router.get('/activity/:activityId', getEmployeeParticipationsByActivity);
router.get('/:employeeId/:activityId', getParticipationByEmployeeAndActivity);

// Create route
router.post('/', createEmployeeParticipation);

// Update routes
router.patch('/:id', updateParticipationStatus);

export default router;
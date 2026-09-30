import express from 'express';
import { getDashboardStats, triggerReminder } from '../controllers/statsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.post('/trigger-reminder', triggerReminder);

export default router;

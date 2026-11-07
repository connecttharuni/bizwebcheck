import { Router } from 'express';
import { getSubscriptionPlans, getCurrentSubscription } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/plans', getSubscriptionPlans);
router.get('/current', protect, getCurrentSubscription);

export default router;

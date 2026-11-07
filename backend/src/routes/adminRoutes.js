import { Router } from 'express';
import {
  getAdminDashboardStats,
  listAllUsers,
  toggleUserStatus,
  adjustUserSubscription,
  listAllPayments,
  listApiLogs
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = Router();

// Protect all admin routes
router.use(protect, adminOnly);

router.get('/stats', getAdminDashboardStats);
router.get('/users', listAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.put('/users/subscription', adjustUserSubscription);
router.get('/payments', listAllPayments);
router.get('/api-logs', listApiLogs);

export default router;

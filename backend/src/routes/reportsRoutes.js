import { Router } from 'express';
import { getReportsData } from '../controllers/reportsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', getReportsData);

export default router;

import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead, exportLeads } from '../controllers/leadsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect); // All lead routes require authentication

router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.get('/export', exportLeads);

export default router;

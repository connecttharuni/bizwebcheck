import { Router } from 'express';
import { searchSingleBusiness, bulkSearchBusinesses, exportSearchResults, getSearchHistory } from '../controllers/searchController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkSearchQuota } from '../middleware/quotaMiddleware.js';

const router = Router();

// Single Business Search (requires auth and credit check)
router.post('/single', protect, checkSearchQuota, searchSingleBusiness);

// Bulk Business Search (requires auth and credit check)
router.post('/bulk', protect, checkSearchQuota, bulkSearchBusinesses);

// Export results (CSV / XLSX)
router.post('/export', protect, exportSearchResults);

// Search history
router.get('/history', protect, getSearchHistory);

export default router;

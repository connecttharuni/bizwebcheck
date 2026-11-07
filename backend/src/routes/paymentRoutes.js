import { Router } from 'express';
import { createPaymentOrder, verifyPayment, getPaymentHistory, razorpayWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Webhook endpoint (Raw body needed for signature verification)
router.post('/webhook', razorpayWebhook);

// Protected routes
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

export default router;

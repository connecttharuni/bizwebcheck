import { createOrder, verifyPaymentSignature, verifyWebhookSignature, PLAN_PRICING } from '../services/razorpayService.js';
import { Store } from '../services/store.js';
import { config } from '../config/env.js';

export async function createPaymentOrder(req, res) {
  try {
    const { plan, billingCycle = 'monthly' } = req.body;
    const userId = req.user._id;

    const planConfig = PLAN_PRICING[plan];
    if (!planConfig) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan selected' });
    }

    if (plan === 'FREE_TRIAL') {
      return res.status(400).json({ success: false, message: 'Free trial does not require payment' });
    }

    const price = billingCycle === 'yearly' ? planConfig.priceYearly : planConfig.priceMonthly;
    const receipt = `rcpt_${userId.toString().slice(-6)}_${Date.now().toString().slice(-6)}`;

    const order = await createOrder({
      amount: price,
      currency: 'INR',
      receipt,
      notes: {
        userId: userId.toString(),
        plan,
        billingCycle
      }
    });

    // Record created payment in database
    await Store.recordPayment({
      user: userId,
      razorpayOrderId: order.id,
      amount: price,
      currency: 'INR',
      plan,
      billingCycle,
      status: 'created',
      receipt
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.razorpayKeyId,
      plan,
      billingCycle,
      isMock: order.isMock || false
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create payment order: ' + err.message });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, billingCycle } = req.body;
    const userId = req.user._id;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Missing payment confirmation parameters' });
    }

    // Server-side HMAC-SHA256 signature verification
    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValid) {
      // Record failed payment
      await Store.recordPayment({
        user: userId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: 0,
        plan: plan || 'STARTER',
        status: 'failed',
        failureReason: 'Server signature mismatch'
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: cryptographic signature mismatch. No subscription was activated.'
      });
    }

    // Payment Verified! Activate subscription on server-side
    const updatedSub = await Store.updateSubscription(userId, plan, billingCycle, razorpay_order_id, razorpay_payment_id);

    // Record captured payment
    const planConfig = PLAN_PRICING[plan] || PLAN_PRICING.STARTER;
    const price = billingCycle === 'yearly' ? planConfig.priceYearly : planConfig.priceMonthly;

    await Store.recordPayment({
      user: userId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: price,
      currency: 'INR',
      plan,
      billingCycle,
      status: 'captured'
    });

    return res.json({
      success: true,
      message: `Subscription successfully activated to ${planConfig.name} plan!`,
      subscription: updatedSub
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Payment verification error: ' + err.message });
  }
}

export async function getPaymentHistory(req, res) {
  try {
    const payments = await Store.getPaymentsByUserId(req.user._id);
    return res.json({ success: true, payments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
}

export async function razorpayWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const isValid = verifyWebhookSignature(req.body, signature);

    if (!isValid) {
      console.warn('⚠️ Webhook received with invalid signature.');
      return res.status(400).json({ status: 'invalid_signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`🔔 Razorpay Webhook Event: ${event}`);

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const notes = payment.notes || {};
      if (notes.userId && notes.plan) {
        await Store.updateSubscription(notes.userId, notes.plan, notes.billingCycle || 'monthly', payment.order_id, payment.id);
      }
    }

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ status: 'error' });
  }
}

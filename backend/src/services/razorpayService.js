import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { config } from '../config/env.js';

let razorpayInstance = null;

export function getRazorpayClient() {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret
    });
  }
  return razorpayInstance;
}

export const PLAN_PRICING = {
  FREE_TRIAL: {
    name: 'Free Trial',
    priceMonthly: 0,
    priceYearly: 0,
    searchLimit: 20,
    features: ['20 Searches', 'Basic website verification', 'Standard search history', 'CSV export']
  },
  STARTER: {
    name: 'Starter',
    priceMonthly: 499, // ₹499/mo
    priceYearly: 4990, // ₹4,990/yr (2 months free)
    searchLimit: 500,
    features: ['500 Searches/month', 'Full website detection & DNS check', 'Search history log', 'CSV export', 'Email support']
  },
  PROFESSIONAL: {
    name: 'Professional',
    priceMonthly: 999, // ₹999/mo
    priceYearly: 9990, // ₹9,990/yr
    searchLimit: 2000,
    features: ['2,000 Searches/month', 'Bulk business search (50 batch)', 'Advanced filters & opportunity scores', 'Excel & CSV export', 'Saved leads CRM']
  },
  BUSINESS: {
    name: 'Business',
    priceMonthly: 1999, // ₹1,999/mo
    priceYearly: 19990, // ₹19,990/yr
    searchLimit: 5000,
    features: ['5,000 Searches/month', 'Unlimited Saved Leads', 'PDF Opportunity Reports', 'Multi-team member support', 'Priority API limits', '24/7 Priority support']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceMonthly: 4999,
    priceYearly: 49990,
    searchLimit: 25000,
    features: ['Custom search quotas', 'Dedicated account manager', 'Custom API access', 'Team workspace', '99.9% uptime SLA']
  }
};

/**
 * Creates a Razorpay Order for a subscription plan.
 */
export async function createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
  // If in mock or placeholder test credentials
  if (!config.razorpayKeyId || config.razorpayKeyId.includes('placeholder')) {
    const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      id: mockOrderId,
      amount: amount * 100, // in paise
      currency,
      receipt,
      status: 'created',
      isMock: true
    };
  }

  try {
    const rzp = getRazorpayClient();
    const order = await rzp.orders.create({
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt,
      notes
    });
    return order;
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    throw new Error(`Razorpay order failed: ${err.error?.description || err.message}`);
  }
}

/**
 * Validates Razorpay Payment Signature on server-side.
 * Formula: HMAC SHA256(order_id + "|" + payment_id, secret) == signature
 */
export function verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }

  // Allow mock test orders
  if (razorpay_order_id.startsWith('order_mock_') && razorpay_signature === 'mock_valid_signature') {
    return true;
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    return generatedSignature === razorpay_signature;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

/**
 * Validates Webhook Signature from Razorpay
 */
export function verifyWebhookSignature(webhookBody, signature) {
  if (!signature || !config.razorpayWebhookSecret) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayWebhookSecret)
      .update(typeof webhookBody === 'string' ? webhookBody : JSON.stringify(webhookBody))
      .digest('hex');
    return expectedSignature === signature;
  } catch (err) {
    return false;
  }
}

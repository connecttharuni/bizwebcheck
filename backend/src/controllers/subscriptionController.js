import { Store } from '../services/store.js';
import { PLAN_PRICING } from '../services/razorpayService.js';

export async function getSubscriptionPlans(req, res) {
  try {
    return res.json({
      success: true,
      plans: PLAN_PRICING
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch plans' });
  }
}

export async function getCurrentSubscription(req, res) {
  try {
    const subscription = await Store.getSubscriptionByUserId(req.user._id);
    const planDetails = PLAN_PRICING[subscription?.plan] || PLAN_PRICING.FREE_TRIAL;

    return res.json({
      success: true,
      subscription,
      planDetails,
      remainingCredits: subscription ? Math.max(0, subscription.searchLimit - subscription.searchesUsed) : 0
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subscription' });
  }
}

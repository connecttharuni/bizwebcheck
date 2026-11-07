import { Store } from '../services/store.js';

export async function checkSearchQuota(req, res, next) {
  try {
    const userId = req.user._id;
    const subscription = await Store.getSubscriptionByUserId(userId);

    if (!subscription) {
      return res.status(403).json({
        success: false,
        code: 'NO_ACTIVE_SUBSCRIPTION',
        message: 'No active subscription found. Please select a plan to continue.'
      });
    }

    // Check expiration
    if (new Date(subscription.endDate) < new Date()) {
      return res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_EXPIRED',
        message: 'Your subscription has expired. Please renew your plan to perform more searches.'
      });
    }

    // Calculate requested quota
    const requestedCount = req.body.limit ? parseInt(req.body.limit, 10) : 1;
    const remainingCredits = subscription.searchLimit - subscription.searchesUsed;

    if (remainingCredits <= 0) {
      return res.status(403).json({
        success: false,
        code: 'QUOTA_EXCEEDED',
        message: `Search credit limit reached (${subscription.searchesUsed}/${subscription.searchLimit}). Please upgrade your plan for more searches.`,
        plan: subscription.plan,
        searchLimit: subscription.searchLimit,
        searchesUsed: subscription.searchesUsed
      });
    }

    // Check if bulk search exceeds remaining
    if (requestedCount > remainingCredits) {
      return res.status(400).json({
        success: false,
        code: 'INSUFFICIENT_CREDITS',
        message: `You requested ${requestedCount} results, but have only ${remainingCredits} credits remaining. Please adjust limit or upgrade.`,
        remainingCredits
      });
    }

    req.subscription = subscription;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify search credits: ' + err.message
    });
  }
}

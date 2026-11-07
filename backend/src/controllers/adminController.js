import { Store } from '../services/store.js';

export async function getAdminDashboardStats(req, res) {
  try {
    const stats = await Store.getAdminStats();
    return res.json({ success: true, stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin stats: ' + err.message });
  }
}

export async function listAllUsers(req, res) {
  try {
    const users = await Store.getAllUsers();
    // Attach current subscription to each user
    const usersWithSubs = await Promise.all(
      users.map(async u => {
        const sub = await Store.getSubscriptionByUserId(u._id);
        return {
          ...u,
          subscription: sub
        };
      })
    );
    return res.json({ success: true, count: usersWithSubs.length, users: usersWithSubs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list users' });
  }
}

export async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'suspended'

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updated = await Store.updateUser(id, { status });
    return res.json({ success: true, message: `User account has been ${status}`, user: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
}

export async function adjustUserSubscription(req, res) {
  try {
    const { userId, plan, searchLimitBonus } = req.body;
    let sub = await Store.getSubscriptionByUserId(userId);

    if (plan) {
      sub = await Store.updateSubscription(userId, plan);
    }
    if (searchLimitBonus) {
      if (sub) {
        sub.searchLimit += parseInt(searchLimitBonus, 10);
      }
    }

    return res.json({ success: true, message: 'User subscription modified successfully', subscription: sub });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to modify subscription' });
  }
}

export async function listAllPayments(req, res) {
  try {
    const payments = await Store.getAllPayments();
    return res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve payments' });
  }
}

export async function listApiLogs(req, res) {
  try {
    const logs = await Store.getApiLogs(100);
    return res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve API logs' });
  }
}

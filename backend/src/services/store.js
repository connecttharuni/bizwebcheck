import bcrypt from 'bcryptjs';
import { isDbConnected } from '../config/db.js';
import { UserModel } from '../models/User.js';
import { SubscriptionModel } from '../models/Subscription.js';
import { BusinessModel } from '../models/Business.js';
import { SavedLeadModel } from '../models/SavedLead.js';
import { SearchHistoryModel } from '../models/SearchHistory.js';
import { PaymentModel } from '../models/Payment.js';
import { UsageTrackingModel } from '../models/UsageTracking.js';
import { ApiUsageLogModel } from '../models/ApiUsageLog.js';
import { PLAN_PRICING } from './razorpayService.js';

// In-Memory Fallback State
const memState = {
  users: [],
  subscriptions: [],
  businesses: [],
  savedLeads: [],
  searchHistory: [],
  payments: [],
  usageTracking: [],
  apiUsageLogs: []
};

// Seed initial memory users if memory mode
async function initMemoryData() {
  if (memState.users.length === 0) {
    const adminHashed = await bcrypt.hash('Admin@123456', 10);
    const demoHashed = await bcrypt.hash('Demo@123456', 10);

    const adminUser = {
      _id: 'mem_user_admin_01',
      name: 'System Administrator',
      email: 'admin@bizwebcheck.com',
      password: adminHashed,
      role: 'ADMIN',
      company: 'BizWebCheck Inc.',
      status: 'active',
      createdAt: new Date('2026-01-01')
    };

    const demoUser = {
      _id: 'mem_user_demo_02',
      name: 'Alex Morgan',
      email: 'demo@bizwebcheck.com',
      password: demoHashed,
      role: 'CUSTOMER',
      company: 'Apex Digital Agency',
      status: 'active',
      createdAt: new Date()
    };

    memState.users.push(adminUser, demoUser);

    // Initial subscriptions
    memState.subscriptions.push(
      {
        _id: 'mem_sub_admin_01',
        user: adminUser._id,
        plan: 'ENTERPRISE',
        status: 'active',
        billingCycle: 'yearly',
        searchLimit: 50000,
        searchesUsed: 12,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        autoRenew: true
      },
      {
        _id: 'mem_sub_demo_02',
        user: demoUser._id,
        plan: 'PROFESSIONAL',
        status: 'active',
        billingCycle: 'monthly',
        searchLimit: 2000,
        searchesUsed: 45,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        autoRenew: true
      }
    );

    // Initial leads for demo
    memState.savedLeads.push(
      {
        _id: 'mem_lead_01',
        user: demoUser._id,
        businessName: 'ABC Bakery & Confectionery',
        location: 'Anna Salai, Chennai, India',
        city: 'Chennai',
        category: 'Bakery',
        websiteStatus: 'Website Not Listed',
        websiteUrl: '',
        googleMapsUri: 'https://maps.google.com/?cid=1002',
        contactDetails: { phone: '+91 98401 22334', email: 'orders@abcbakerychennai.in', contactPerson: 'Murali Kumar' },
        leadStatus: 'Contacted',
        opportunityType: 'New Website Development',
        estimatedValue: 35000,
        notes: 'Spoke with store manager. Interested in an online ordering menu and WhatsApp integration.',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000)
      },
      {
        _id: 'mem_lead_02',
        user: demoUser._id,
        businessName: 'Apex Digital Marketing Agency',
        location: 'OMR, Chennai, India',
        city: 'Chennai',
        category: 'Digital Marketing',
        websiteStatus: 'Website Unreachable',
        websiteUrl: 'http://this-is-a-definitely-non-existent-expired-domain-bizwebcheck-test.org',
        googleMapsUri: 'https://maps.google.com/?cid=1006',
        contactDetails: { phone: '+91 94441 88990', email: '', contactPerson: 'Priya Sundar' },
        leadStatus: 'Interested',
        opportunityType: 'Website Recovery & Modernization',
        estimatedValue: 45000,
        notes: 'Domain is giving DNS errors. Offered recovery and modern React redesign.',
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000)
      },
      {
        _id: 'mem_lead_03',
        user: demoUser._id,
        businessName: 'Hotel Saravana Traditional Meals',
        location: 'North Car Street, Chennai, India',
        city: 'Chennai',
        category: 'Restaurant',
        websiteStatus: 'Website Not Listed',
        websiteUrl: '',
        googleMapsUri: 'https://maps.google.com/?cid=1007',
        contactDetails: { phone: '+91 44 2833 4455', email: '', contactPerson: 'Owner desk' },
        leadStatus: 'New',
        opportunityType: 'New Website Development',
        estimatedValue: 30000,
        notes: 'Busy restaurant with high footfall but zero website presence. High conversion potential.',
        createdAt: new Date()
      }
    );

    // Initial search history
    memState.searchHistory.push(
      {
        _id: 'mem_hist_01',
        user: demoUser._id,
        searchType: 'single',
        query: { businessName: 'ABC Bakery', city: 'Chennai', category: 'Bakery' },
        resultsCount: 1,
        opportunitiesFound: 1,
        resultsSnapshot: [
          {
            placeId: 'mock_place_abc_bakery_02',
            name: 'ABC Bakery & Confectionery',
            category: 'Bakery',
            location: '12 Anna Salai, Chennai, India',
            websiteStatus: 'Website Not Listed',
            websiteUrl: null,
            recommendation: 'Potential website development opportunity.',
            opportunityScore: 95
          }
        ],
        createdAt: new Date(Date.now() - 4 * 3600 * 1000)
      },
      {
        _id: 'mem_hist_02',
        user: demoUser._id,
        searchType: 'bulk',
        query: { city: 'Chennai', category: 'Restaurants' },
        resultsCount: 5,
        opportunitiesFound: 3,
        resultsSnapshot: [],
        createdAt: new Date(Date.now() - 24 * 3600 * 1000)
      }
    );

    // Initial sample payments
    memState.payments.push({
      _id: 'mem_pay_01',
      user: demoUser._id,
      razorpayOrderId: 'order_starter_demo_init',
      razorpayPaymentId: 'pay_demo_success_998',
      amount: 999,
      currency: 'INR',
      plan: 'PROFESSIONAL',
      billingCycle: 'monthly',
      status: 'captured',
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000)
    });

    // Initial api logs
    memState.apiUsageLogs.push(
      {
        _id: 'mem_log_01',
        provider: 'mock_provider',
        endpoint: 'searchText',
        method: 'POST',
        requestedBy: demoUser._id,
        query: 'ABC Bakery, Chennai',
        status: 'success',
        httpStatus: 200,
        responseDurationMs: 310,
        fieldsRequested: ['displayName', 'websiteUri', 'formattedAddress'],
        timestamp: new Date(Date.now() - 3600 * 1000)
      }
    );
  }
}

initMemoryData();

export const Store = {
  // --- USERS ---
  async findUserByEmail(email, selectPassword = false) {
    if (isDbConnected()) {
      const q = UserModel.findOne({ email: email.toLowerCase() });
      if (selectPassword) q.select('+password');
      return await q.exec();
    }
    const u = memState.users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return null;
    const cloned = { ...u };
    if (!selectPassword) delete cloned.password;
    return cloned;
  },

  async findUserById(id) {
    if (isDbConnected()) {
      return await UserModel.findById(id).exec();
    }
    const u = memState.users.find(x => x._id.toString() === id.toString());
    if (!u) return null;
    const cloned = { ...u };
    delete cloned.password;
    return cloned;
  },

  async createUser(userData) {
    if (isDbConnected()) {
      return await UserModel.create(userData);
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = {
      _id: `mem_user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: userData.role || 'CUSTOMER',
      company: userData.company || '',
      status: 'active',
      createdAt: new Date()
    };
    memState.users.push(newUser);

    // Create default Free Trial subscription
    const newSub = {
      _id: `mem_sub_${Date.now()}`,
      user: newUser._id,
      plan: 'FREE_TRIAL',
      status: 'active',
      billingCycle: 'monthly',
      searchLimit: 20,
      searchesUsed: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      autoRenew: false
    };
    memState.subscriptions.push(newSub);

    const cloned = { ...newUser };
    delete cloned.password;
    return cloned;
  },

  async updateUser(id, updateData) {
    if (isDbConnected()) {
      return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    }
    const index = memState.users.findIndex(x => x._id.toString() === id.toString());
    if (index === -1) return null;
    memState.users[index] = { ...memState.users[index], ...updateData };
    const cloned = { ...memState.users[index] };
    delete cloned.password;
    return cloned;
  },

  async getAllUsers() {
    if (isDbConnected()) {
      return await UserModel.find().select('-password').sort({ createdAt: -1 });
    }
    return memState.users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
  },

  // --- SUBSCRIPTIONS ---
  async getSubscriptionByUserId(userId) {
    if (isDbConnected()) {
      return await SubscriptionModel.findOne({ user: userId, status: 'active' });
    }
    return memState.subscriptions.find(s => s.user.toString() === userId.toString() && s.status === 'active') || null;
  },

  async updateSubscription(userId, newPlan, billingCycle = 'monthly', razorpayOrderId = null, paymentId = null) {
    const planConfig = PLAN_PRICING[newPlan] || PLAN_PRICING.FREE_TRIAL;
    const durationDays = billingCycle === 'yearly' ? 365 : 30;

    if (isDbConnected()) {
      let sub = await SubscriptionModel.findOne({ user: userId });
      if (sub) {
        sub.plan = newPlan;
        sub.status = 'active';
        sub.billingCycle = billingCycle;
        sub.searchLimit = planConfig.searchLimit;
        sub.startDate = new Date();
        sub.endDate = new Date(Date.now() + durationDays * 24 * 3600 * 1000);
        if (razorpayOrderId) sub.razorpayOrderId = razorpayOrderId;
        if (paymentId) sub.razorpayPaymentId = paymentId;
        return await sub.save();
      } else {
        return await SubscriptionModel.create({
          user: userId,
          plan: newPlan,
          status: 'active',
          billingCycle,
          searchLimit: planConfig.searchLimit,
          searchesUsed: 0,
          startDate: new Date(),
          endDate: new Date(Date.now() + durationDays * 24 * 3600 * 1000),
          razorpayOrderId,
          razorpayPaymentId: paymentId
        });
      }
    }

    let subIndex = memState.subscriptions.findIndex(s => s.user.toString() === userId.toString());
    const updatedSub = {
      _id: subIndex >= 0 ? memState.subscriptions[subIndex]._id : `mem_sub_${Date.now()}`,
      user: userId,
      plan: newPlan,
      status: 'active',
      billingCycle,
      searchLimit: planConfig.searchLimit,
      searchesUsed: subIndex >= 0 ? 0 : 0, // Reset usage counter on upgrade
      startDate: new Date(),
      endDate: new Date(Date.now() + durationDays * 24 * 3600 * 1000),
      razorpayOrderId,
      razorpayPaymentId: paymentId,
      autoRenew: true
    };

    if (subIndex >= 0) {
      memState.subscriptions[subIndex] = updatedSub;
    } else {
      memState.subscriptions.push(updatedSub);
    }
    return updatedSub;
  },

  async incrementSearchUsage(userId, count = 1) {
    if (isDbConnected()) {
      return await SubscriptionModel.findOneAndUpdate(
        { user: userId, status: 'active' },
        { $inc: { searchesUsed: count } },
        { new: true }
      );
    }
    const sub = memState.subscriptions.find(s => s.user.toString() === userId.toString() && s.status === 'active');
    if (sub) {
      sub.searchesUsed += count;
    }
    return sub;
  },

  // --- SAVED LEADS ---
  async getLeadsByUserId(userId, filters = {}) {
    if (isDbConnected()) {
      const q = { user: userId };
      if (filters.status && filters.status !== 'All') q.leadStatus = filters.status;
      if (filters.websiteStatus && filters.websiteStatus !== 'All') q.websiteStatus = filters.websiteStatus;
      if (filters.search) {
        q.$or = [
          { businessName: { $regex: filters.search, $options: 'i' } },
          { city: { $regex: filters.search, $options: 'i' } },
          { category: { $regex: filters.search, $options: 'i' } }
        ];
      }
      return await SavedLeadModel.find(q).sort({ createdAt: -1 });
    }

    return memState.savedLeads
      .filter(lead => {
        if (lead.user.toString() !== userId.toString()) return false;
        if (filters.status && filters.status !== 'All' && lead.leadStatus !== filters.status) return false;
        if (filters.websiteStatus && filters.websiteStatus !== 'All' && lead.websiteStatus !== filters.websiteStatus) return false;
        if (filters.search) {
          const s = filters.search.toLowerCase();
          const matchName = lead.businessName.toLowerCase().includes(s);
          const matchCity = (lead.city || '').toLowerCase().includes(s);
          const matchCat = (lead.category || '').toLowerCase().includes(s);
          if (!matchName && !matchCity && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async createLead(leadData) {
    if (isDbConnected()) {
      return await SavedLeadModel.create(leadData);
    }
    const newLead = {
      _id: `mem_lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ...leadData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memState.savedLeads.unshift(newLead);
    return newLead;
  },

  async updateLead(leadId, userId, updateData) {
    if (isDbConnected()) {
      return await SavedLeadModel.findOneAndUpdate(
        { _id: leadId, user: userId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
    }
    const idx = memState.savedLeads.findIndex(l => l._id.toString() === leadId.toString() && l.user.toString() === userId.toString());
    if (idx === -1) return null;
    memState.savedLeads[idx] = { ...memState.savedLeads[idx], ...updateData, updatedAt: new Date() };
    return memState.savedLeads[idx];
  },

  async deleteLead(leadId, userId) {
    if (isDbConnected()) {
      return await SavedLeadModel.findOneAndDelete({ _id: leadId, user: userId });
    }
    const idx = memState.savedLeads.findIndex(l => l._id.toString() === leadId.toString() && l.user.toString() === userId.toString());
    if (idx === -1) return false;
    memState.savedLeads.splice(idx, 1);
    return true;
  },

  // --- SEARCH HISTORY ---
  async addSearchHistory(historyData) {
    if (isDbConnected()) {
      return await SearchHistoryModel.create(historyData);
    }
    const newHistory = {
      _id: `mem_hist_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ...historyData,
      createdAt: new Date()
    };
    memState.searchHistory.unshift(newHistory);
    return newHistory;
  },

  async getSearchHistoryByUserId(userId, limit = 50) {
    if (isDbConnected()) {
      return await SearchHistoryModel.find({ user: userId }).sort({ createdAt: -1 }).limit(limit);
    }
    return memState.searchHistory
      .filter(h => h.user.toString() === userId.toString())
      .slice(0, limit);
  },

  // --- PAYMENTS ---
  async recordPayment(paymentData) {
    if (isDbConnected()) {
      return await PaymentModel.create(paymentData);
    }
    const newPayment = {
      _id: `mem_pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ...paymentData,
      createdAt: new Date()
    };
    memState.payments.unshift(newPayment);
    return newPayment;
  },

  async getPaymentsByUserId(userId) {
    if (isDbConnected()) {
      return await PaymentModel.find({ user: userId }).sort({ createdAt: -1 });
    }
    return memState.payments.filter(p => p.user.toString() === userId.toString());
  },

  async getAllPayments() {
    if (isDbConnected()) {
      return await PaymentModel.find().populate('user', 'name email company').sort({ createdAt: -1 });
    }
    return memState.payments.map(p => {
      const user = memState.users.find(u => u._id.toString() === p.user.toString());
      return {
        ...p,
        user: user ? { name: user.name, email: user.email, company: user.company } : null
      };
    });
  },

  // --- API USAGE LOGS ---
  async logApiUsage(logData) {
    if (isDbConnected()) {
      return await ApiUsageLogModel.create(logData);
    }
    const newLog = {
      _id: `mem_log_${Date.now()}`,
      ...logData,
      timestamp: new Date()
    };
    memState.apiUsageLogs.unshift(newLog);
    if (memState.apiUsageLogs.length > 500) memState.apiUsageLogs.pop();
    return newLog;
  },

  async getApiLogs(limit = 100) {
    if (isDbConnected()) {
      return await ApiUsageLogModel.find().populate('requestedBy', 'name email').sort({ timestamp: -1 }).limit(limit);
    }
    return memState.apiUsageLogs.slice(0, limit).map(l => {
      const user = memState.users.find(u => u._id.toString() === (l.requestedBy ? l.requestedBy.toString() : ''));
      return {
        ...l,
        requestedBy: user ? { name: user.name, email: user.email } : null
      };
    });
  },

  // --- ADMIN STATS ---
  async getAdminStats() {
    let totalUsers = 0;
    let activeSubscriptions = 0;
    let totalSearches = 0;
    let totalRevenue = 0;
    let apiFailures = 0;

    if (isDbConnected()) {
      totalUsers = await UserModel.countDocuments();
      activeSubscriptions = await SubscriptionModel.countDocuments({ status: 'active', plan: { $ne: 'FREE_TRIAL' } });
      const historyAgg = await SearchHistoryModel.aggregate([{ $group: { _id: null, total: { $sum: '$resultsCount' } } }]);
      totalSearches = historyAgg[0]?.total || 0;
      const revAgg = await PaymentModel.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
      totalRevenue = revAgg[0]?.total || 0;
      apiFailures = await ApiUsageLogModel.countDocuments({ status: { $in: ['error', 'rate_limited', 'quota_exceeded'] } });
    } else {
      totalUsers = memState.users.length;
      activeSubscriptions = memState.subscriptions.filter(s => s.status === 'active' && s.plan !== 'FREE_TRIAL').length;
      totalSearches = memState.searchHistory.reduce((acc, h) => acc + (h.resultsCount || 0), 0);
      totalRevenue = memState.payments.filter(p => p.status === 'captured').reduce((acc, p) => acc + (p.amount || 0), 0);
      apiFailures = memState.apiUsageLogs.filter(l => ['error', 'rate_limited', 'quota_exceeded'].includes(l.status)).length;
    }

    return {
      totalUsers,
      activeSubscriptions,
      totalSearches,
      totalRevenue,
      apiFailures,
      totalApiLogs: isDbConnected() ? await ApiUsageLogModel.countDocuments() : memState.apiUsageLogs.length
    };
  }
};

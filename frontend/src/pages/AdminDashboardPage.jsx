import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  CreditCard, 
  Search, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Sparkles,
  Server,
  RefreshCw,
  Plus
} from 'lucide-react';
import api from '../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [apiLogs, setApiLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'payments', 'apilogs'
  const [message, setMessage] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, paymentsRes, logsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/payments'),
        api.get('/admin/api-logs')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users || []);
      if (paymentsRes.data.success) setPayments(paymentsRes.data.payments || []);
      if (logsRes.data.success) setApiLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
        setMessage(`User account ${newStatus === 'active' ? 'activated' : 'suspended'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Failed to update user status: ' + err.message);
    }
  };

  const handleGrantCredits = async (userId, bonus) => {
    try {
      const res = await api.put('/admin/users/subscription', {
        userId,
        searchLimitBonus: bonus
      });
      if (res.data.success) {
        setMessage(`Granted +${bonus} credits to user!`);
        loadAdminData();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Failed to grant credits: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-slate-400">Loading administrator control panel...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            System Administration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Governance Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor API usage, manage user accounts & subscriptions, track billing, and inspect system audit logs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</div>
          <p className="mt-1 text-[11px] text-slate-500">Registered platform accounts</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">Active Paid Subs</span>
          <div className="mt-2 text-2xl font-black text-indigo-600">{stats?.activeSubscriptions || 0}</div>
          <p className="mt-1 text-[11px] text-slate-500">Starter, Pro, & Business</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">Total Revenue</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">₹{(stats?.totalRevenue || 0).toLocaleString()}</div>
          <p className="mt-1 text-[11px] text-slate-500">Processed through Razorpay</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Searches</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats?.totalSearches || 0}</div>
          <p className="mt-1 text-[11px] text-slate-500">Single & bulk searches run</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">API Errors</span>
          <div className="mt-2 text-2xl font-black text-rose-600">{stats?.apiFailures || 0}</div>
          <p className="mt-1 text-[11px] text-slate-500">Failed / throttled requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> User Accounts & Quotas ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Payments & Transactions ({payments.length})
        </button>

        <button
          onClick={() => setActiveTab('apilogs')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'apilogs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" /> Provider API Logs ({apiLogs.length})
        </button>
      </div>

      {/* TAB 1: USERS TABLE */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Company</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Active Plan</th>
                  <th className="px-4 py-3.5">Credit Quota</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map(u => {
                  const sub = u.subscription;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">{u.company || '—'}</td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        {sub?.plan?.replace('_', ' ') || 'Free Trial'}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-indigo-600">{sub?.searchesUsed || 0}</span>
                        <span className="text-slate-400"> / {sub?.searchLimit || 20}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleGrantCredits(u._id, 100)}
                          className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold"
                          title="Grant 100 Search Credits"
                        >
                          +100 Credits
                        </button>

                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.status)}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS TABLE */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Order ID</th>
                  <th className="px-4 py-3.5">Plan</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{p.user?.name || 'Customer'}</td>
                    <td className="px-4 py-3 font-mono text-[11px]">{p.razorpayOrderId}</td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{p.plan}</td>
                    <td className="px-4 py-3 font-black text-slate-900">₹{p.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'captured' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-400">
                      {p.razorpayPaymentId || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: API LOGS TABLE */}
      {activeTab === 'apilogs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Provider</th>
                  <th className="px-4 py-3.5">Endpoint</th>
                  <th className="px-4 py-3.5">Query</th>
                  <th className="px-4 py-3.5">Latency</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">HTTP Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {apiLogs.map(l => (
                  <tr key={l._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{l.provider}</td>
                    <td className="px-4 py-3 font-mono text-[11px]">{l.endpoint}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600">{l.query}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{l.responseDurationMs || 0}ms</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        l.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">
                      {l.httpStatus || 200}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

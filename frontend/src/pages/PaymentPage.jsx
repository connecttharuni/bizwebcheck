import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Download, 
  Receipt, 
  Lock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'PROFESSIONAL';
  const billingCycle = searchParams.get('billing') || 'monthly';

  const { user, subscription, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [orderData, setOrderData] = useState(null);

  const planPrices = {
    STARTER: { name: 'Starter Plan', monthly: 499, yearly: 4990, searches: 500 },
    PROFESSIONAL: { name: 'Professional Plan', monthly: 999, yearly: 9990, searches: 2000 },
    BUSINESS: { name: 'Business Plan', monthly: 1999, yearly: 19990, searches: 5000 },
    ENTERPRISE: { name: 'Enterprise Plan', monthly: 4999, yearly: 49990, searches: 25000 }
  };

  const currentConfig = planPrices[selectedPlan] || planPrices.PROFESSIONAL;
  const amountToPay = billingCycle === 'yearly' ? currentConfig.yearly : currentConfig.monthly;

  // Load past payment history
  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await api.get('/payments/history');
        if (res.data.success) {
          setPaymentHistory(res.data.payments || []);
        }
      } catch (err) {
        console.error('Failed to load payments:', err);
      }
    }
    loadPayments();
  }, [success]);

  // Handle Payment Initiation
  const handleInitiatePayment = async () => {
    setError('');
    setLoading(true);

    try {
      // 1. Create order on server
      const res = await api.post('/payments/create-order', {
        plan: selectedPlan,
        billingCycle
      });

      if (!res.data.success) {
        throw new Error(res.data.message || 'Order creation failed');
      }

      setOrderData(res.data);

      // If mock test order or Razorpay client is missing
      if (res.data.isMock || !window.Razorpay) {
        // Offer simulation test button directly
        return;
      }

      // 2. Open standard Razorpay Checkout Modal
      const options = {
        key: res.data.keyId,
        amount: res.data.amount,
        currency: res.data.currency,
        name: 'BizWebCheck SaaS',
        description: `Subscription to ${currentConfig.name} (${billingCycle})`,
        order_id: res.data.orderId,
        handler: async function (response) {
          await verifyPaymentOnServer(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  // 3. Server-side signature verification & activation
  const verifyPaymentOnServer = async (orderId, paymentId, signature) => {
    setLoading(true);
    try {
      const res = await api.post('/payments/verify', {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        plan: selectedPlan,
        billingCycle
      });

      if (res.data.success) {
        setSuccess(`Payment verified! ${currentConfig.name} successfully activated.`);
        refreshProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Test mode simulation handler
  const handleSimulatePayment = async () => {
    const mockOrderId = orderData?.orderId || `order_mock_${Date.now()}`;
    const mockPaymentId = `pay_mock_${Date.now()}`;
    const mockSignature = 'mock_valid_signature';
    await verifyPaymentOnServer(mockOrderId, mockPaymentId, mockSignature);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Title */}
      <div className="border-b border-slate-200 pb-5">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Plans
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Checkout & Subscription Upgrade
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete payment securely via Razorpay to activate high-volume search limits.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go to Dashboard →
          </button>
        </div>
      )}

      {/* Checkout Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Selected Plan</span>
              <span className="font-bold text-slate-900">{currentConfig.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Billing Cycle</span>
              <span className="font-bold text-slate-900 capitalize">{billingCycle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Monthly Search Quota</span>
              <span className="font-bold text-indigo-600">{currentConfig.searches.toLocaleString()} searches</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-900">Total Payable</span>
              <span className="font-black text-indigo-600 text-lg">₹{amountToPay.toLocaleString()}</span>
            </div>
          </div>

          {/* Razorpay Checkout Trigger */}
          <div className="space-y-3">
            <button
              onClick={handleInitiatePayment}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Connecting to Razorpay...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay ₹{amountToPay.toLocaleString()} via Razorpay
                </>
              )}
            </button>

            {/* Test Simulation Button */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Testing / Development Mode
              </span>
              <p className="text-xs text-slate-600">
                You can simulate a successful Razorpay payment callback to test instant subscription activation:
              </p>
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                Simulate Successful Payment & Verify Signature
              </button>
            </div>
          </div>

          {/* Razorpay Test Mode Guidance */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">Razorpay Test Mode Info:</p>
            <p>Cards: Enter any valid test card (e.g. <code>4111 1111 1111 1111</code>, CVV: <code>123</code>)</p>
            <p>UPI: Enter any test VPA (e.g. <code>success@razorpay</code>)</p>
          </div>
        </div>

        {/* Security / Perks Column */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-5 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>Guaranteed Secure</span>
          </div>
          <p className="leading-relaxed">
            Payment transactions are processed over 256-bit TLS encryption with Razorpay. Subscription keys are cryptographically verified server-side.
          </p>
          <div className="space-y-2 pt-2 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant credit limit increment</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>CSV & Excel exports unlocked</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cancel or renew at any time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History & Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-indigo-600" />
          Payment Records & Invoices
        </h2>

        {paymentHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No payment records found. Completed transactions will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paymentHistory.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-mono text-[11px]">{p.razorpayOrderId}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{p.plan}</td>
                    <td className="px-4 py-3 font-bold">₹{p.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'captured' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-indigo-600">
                      {p.receipt || `rcpt_${p._id.slice(-6)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

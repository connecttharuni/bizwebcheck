import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    index: true
  },
  razorpaySignature: String,
  amount: {
    type: Number,
    required: true // in INR
  },
  currency: {
    type: String,
    default: 'INR'
  },
  plan: {
    type: String,
    required: true,
    enum: ['FREE_TRIAL', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE']
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['created', 'captured', 'failed', 'refunded'],
    default: 'created',
    index: true
  },
  receipt: String,
  failureReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const PaymentModel = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

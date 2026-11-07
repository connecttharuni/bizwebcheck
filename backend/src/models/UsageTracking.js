import mongoose from 'mongoose';

const UsageTrackingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  monthYear: {
    type: String, // e.g. "2026-11"
    required: true,
    index: true
  },
  totalSearches: {
    type: Number,
    default: 0
  },
  bulkSearches: {
    type: Number,
    default: 0
  },
  leadsSaved: {
    type: Number,
    default: 0
  },
  exportsCount: {
    type: Number,
    default: 0
  },
  lastSearchAt: Date
}, {
  timestamps: true
});

UsageTrackingSchema.index({ user: 1, monthYear: 1 }, { unique: true });

export const UsageTrackingModel = mongoose.models.UsageTracking || mongoose.model('UsageTracking', UsageTrackingSchema);

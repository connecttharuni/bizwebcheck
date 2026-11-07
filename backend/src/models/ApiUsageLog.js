import mongoose from 'mongoose';

const ApiUsageLogSchema = new mongoose.Schema({
  provider: {
    type: String,
    default: 'google_places_new',
    index: true
  },
  endpoint: {
    type: String,
    default: 'searchText'
  },
  method: {
    type: String,
    default: 'POST'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  query: String,
  status: {
    type: String,
    enum: ['success', 'rate_limited', 'quota_exceeded', 'error'],
    default: 'success',
    index: true
  },
  httpStatus: Number,
  responseDurationMs: {
    type: Number,
    default: 0
  },
  fieldsRequested: [String],
  errorMessage: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export const ApiUsageLogModel = mongoose.models.ApiUsageLog || mongoose.model('ApiUsageLog', ApiUsageLogSchema);

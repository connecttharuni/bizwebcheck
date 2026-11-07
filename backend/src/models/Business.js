import mongoose from 'mongoose';

const BusinessSchema = new mongoose.Schema({
  placeId: {
    type: String,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    index: true
  },
  category: {
    type: String,
    index: true
  },
  provider: {
    type: String,
    default: 'google_places_new'
  },
  providerWebsiteUri: String,
  googleMapsUri: String,
  verifiedWebsiteUrl: String,
  websiteStatus: {
    type: String,
    enum: [
      'Website Found',
      'Website Not Listed',
      'Website Unreachable',
      'Unable to Verify',
      'Business Not Found'
    ],
    required: true,
    index: true
  },
  verificationDetails: {
    httpStatus: Number,
    dnsResolved: Boolean,
    ip: String,
    redirectsFollowed: Number,
    finalUrl: String,
    responseTimeMs: Number,
    details: String
  },
  recommendation: String,
  opportunityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastVerifiedAt: {
    type: Date,
    default: Date.now
  },
  searchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const BusinessModel = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

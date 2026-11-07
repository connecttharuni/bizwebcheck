import mongoose from 'mongoose';

const SearchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  searchType: {
    type: String,
    enum: ['single', 'bulk'],
    default: 'single'
  },
  query: {
    businessName: { type: String, default: '' },
    location: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    category: { type: String, default: '' }
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  opportunitiesFound: {
    type: Number,
    default: 0
  },
  resultsSnapshot: [
    {
      placeId: String,
      name: String,
      category: String,
      location: String,
      websiteStatus: String,
      websiteUrl: String,
      recommendation: String,
      opportunityScore: Number
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export const SearchHistoryModel = mongoose.models.SearchHistory || mongoose.model('SearchHistory', SearchHistorySchema);

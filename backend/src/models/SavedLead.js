import mongoose from 'mongoose';

const SavedLeadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  websiteStatus: {
    type: String,
    enum: [
      'Website Found',
      'Website Not Listed',
      'Website Unreachable',
      'Unable to Verify',
      'Business Not Found'
    ],
    default: 'Website Not Listed'
  },
  websiteUrl: {
    type: String,
    default: ''
  },
  googleMapsUri: {
    type: String,
    default: ''
  },
  contactDetails: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    contactPerson: { type: String, default: '' }
  },
  leadStatus: {
    type: String,
    enum: ['New', 'Contacted', 'Interested', 'Converted', 'Not Interested'],
    default: 'New',
    index: true
  },
  opportunityType: {
    type: String,
    default: 'New Website Development'
  },
  estimatedValue: {
    type: Number,
    default: 25000 // In INR typical website design fee
  },
  notes: {
    type: String,
    default: ''
  },
  tags: [String]
}, {
  timestamps: true
});

export const SavedLeadModel = mongoose.models.SavedLead || mongoose.model('SavedLead', SavedLeadSchema);

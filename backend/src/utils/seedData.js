import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { UserModel } from '../models/User.js';
import { SubscriptionModel } from '../models/Subscription.js';
import { SavedLeadModel } from '../models/SavedLead.js';
import { PaymentModel } from '../models/Payment.js';

async function seed() {
  console.log('Connecting to database...');
  await mongoose.connect(config.mongoUri);
  console.log('Connected.');

  console.log('Clearing existing records...');
  await UserModel.deleteMany({});
  await SubscriptionModel.deleteMany({});
  await SavedLeadModel.deleteMany({});
  await PaymentModel.deleteMany({});

  console.log('Creating Admin & Demo Accounts...');
  const adminHashed = await bcrypt.hash('Admin@123456', 10);
  const demoHashed = await bcrypt.hash('Demo@123456', 10);

  const admin = await UserModel.create({
    name: 'Administrator',
    email: 'admin@bizwebcheck.com',
    password: adminHashed,
    role: 'ADMIN',
    company: 'BizWebCheck Inc.',
    status: 'active'
  });

  const demoUser = await UserModel.create({
    name: 'Alex Morgan',
    email: 'demo@bizwebcheck.com',
    password: demoHashed,
    role: 'CUSTOMER',
    company: 'Apex Digital Agency',
    status: 'active'
  });

  await SubscriptionModel.create([
    {
      user: admin._id,
      plan: 'ENTERPRISE',
      status: 'active',
      billingCycle: 'yearly',
      searchLimit: 50000,
      searchesUsed: 15,
      autoRenew: true
    },
    {
      user: demoUser._id,
      plan: 'PROFESSIONAL',
      status: 'active',
      billingCycle: 'monthly',
      searchLimit: 2000,
      searchesUsed: 42,
      autoRenew: true
    }
  ]);

  await SavedLeadModel.create([
    {
      user: demoUser._id,
      businessName: 'ABC Bakery & Confectionery',
      location: '12 Anna Salai, Chennai, India',
      city: 'Chennai',
      category: 'Bakery',
      websiteStatus: 'Website Not Listed',
      contactDetails: { phone: '+91 98401 22334', email: 'orders@abcbakery.in', contactPerson: 'Murali Kumar' },
      leadStatus: 'Contacted',
      opportunityType: 'New Website Development',
      estimatedValue: 35000,
      notes: 'Busy bakery in central Chennai without an official website. Pitching 5-page menu & WhatsApp ordering.'
    },
    {
      user: demoUser._id,
      businessName: 'Apex Digital Marketing Agency',
      location: 'OMR, Chennai, India',
      city: 'Chennai',
      category: 'Digital Marketing',
      websiteStatus: 'Website Unreachable',
      websiteUrl: 'http://this-is-a-definitely-non-existent-expired-domain-bizwebcheck-test.org',
      leadStatus: 'Interested',
      opportunityType: 'Website Recovery & Hosting Fix',
      estimatedValue: 45000,
      notes: 'Current listed domain failed DNS resolution. Discussing website migration & modern redesign.'
    }
  ]);

  console.log('✅ Database seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

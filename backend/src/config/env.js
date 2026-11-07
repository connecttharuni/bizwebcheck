import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bizwebcheck',
  jwtSecret: process.env.JWT_SECRET || 'bizwebcheck_super_secret_jwt_key_2026_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Google Places API (New)
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  googlePlacesBaseUrl: 'https://places.googleapis.com/v1/places:searchText',
  
  // Razorpay
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_webhook_secret',

  // Website verification options
  verifier: {
    timeoutMs: parseInt(process.env.VERIFIER_TIMEOUT_MS || '6000', 10),
    maxRedirects: 4,
    maxBodySize: 1024 * 1024 // 1MB max payload to inspect
  }
};

require('dotenv').config();

console.log('=== Stripe Configuration Verification ===\n');

// Check if environment variables are loaded
console.log('Environment Variables Status:');
console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET');
console.log('- STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET');
console.log('- STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'NOT SET');

if (process.env.STRIPE_SECRET_KEY) {
  console.log('\nSecret Key Format Check:');
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (secretKey.startsWith('sk_test_')) {
    console.log('✅ Secret key is in TEST mode');
  } else if (secretKey.startsWith('sk_live_')) {
    console.log('✅ Secret key is in LIVE mode');
  } else {
    console.log('❌ Invalid secret key format');
  }
}

if (process.env.STRIPE_PUBLISHABLE_KEY) {
  console.log('\nPublishable Key Format Check:');
  const pubKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (pubKey.startsWith('pk_test_')) {
    console.log('✅ Publishable key is in TEST mode');
  } else if (pubKey.startsWith('pk_live_')) {
    console.log('✅ Publishable key is in LIVE mode');
  } else {
    console.log('❌ Invalid publishable key format');
  }
}

// Check if both keys are from same environment
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY) {
  const secretIsTest = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
  const pubIsTest = process.env.STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_');
  
  console.log('\nEnvironment Consistency Check:');
  if (secretIsTest === pubIsTest) {
    console.log('✅ Both keys are from the same environment');
  } else {
    console.log('❌ Keys are from different environments (test/live mismatch)');
  }
}

// Test Stripe initialization
console.log('\nStripe Initialization Test:');
try {
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized successfully');
  } else {
    console.log('❌ Cannot initialize Stripe - no secret key');
  }
} catch (error) {
  console.log('❌ Stripe initialization failed:', error.message);
}

console.log('\n=== End Verification ===');

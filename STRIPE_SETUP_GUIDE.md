# Stripe Payment Setup Guide

## 🚨 **IMPORTANT: You need to set up Stripe keys to make payments work!**

The error `No such payment_intent` occurs because Stripe is not properly configured. Follow these steps:

## 1. Get Stripe Test Keys

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create a free Stripe account
3. Go to **Developers > API Keys**
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Copy your **Secret key** (starts with `sk_test_`)

## 2. Configure Environment Variables

### Server Configuration (`server/.env`)
```env
# Add these to your server/.env file
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

### Client Configuration (`client/.env`)
```env
# Add this to your client/.env file
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

## 3. Test Card Information

Use these **TEST** card details for Stripe payments:

### ✅ **Successful Payment Cards:**
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVC:** Any 3 digits (e.g., `123`)
- **Name:** Any name (e.g., `John Doe`)

### 🔄 **Other Test Cards:**
- **Visa:** `4242 4242 4242 4242`
- **Visa (debit):** `4000 0566 5566 5556`
- **Mastercard:** `5555 5555 5555 4444`
- **American Express:** `3782 822463 10005`

### ❌ **Cards that will fail (for testing):**
- **Declined:** `4000 0000 0000 0002`
- **Insufficient funds:** `4000 0000 0000 9995`
- **Expired card:** `4000 0000 0000 0069`

## 4. Restart Your Application

After adding the environment variables:

```bash
# Stop both client and server
# Then restart them

# Server
cd server
npm start

# Client (in new terminal)
cd client
npm start
```

## 5. Testing the Payment Flow

1. Create a course with an application fee > 0
2. Go to the application form
3. Fill out the form
4. Click "Proceed to Payment"
5. Use the test card: `4242 4242 4242 4242`
6. Payment should succeed!

## 🔧 **Troubleshooting:**

- **"Stripe is not configured"** → Add environment variables
- **"No such payment_intent"** → Wrong Stripe keys or environment not loaded
- **"Invalid application fee"** → Course doesn't have applicationFee set
- **Payment fails** → Check browser console for detailed errors

## ⚠️ **CRITICAL: Key Mismatch Issue**

If you get `"No such payment_intent: 'pi_xxx'"` error:

1. **Check your Stripe Dashboard**: Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. **Copy BOTH keys from the SAME account**:
   - Publishable key: `pk_test_51ABC123...` 
   - Secret key: `sk_test_51ABC123...`
3. **Verify the account ID matches** (the part after `pk_test_` and `sk_test_` should be identical)
4. **Replace ALL keys in both .env files**
5. **Restart both server and client**

## 🔍 **Debug Steps:**
1. Check browser console for payment intent creation logs
2. Verify server logs show successful payment intent creation
3. Ensure both keys are from test environment (start with `pk_test_` and `sk_test_`)
4. Make sure no old/cached environment variables are being used

## 📝 **Note:**
- These are **TEST** keys and cards - no real money is charged
- In production, you'll need to use live Stripe keys
- Never commit real Stripe keys to version control

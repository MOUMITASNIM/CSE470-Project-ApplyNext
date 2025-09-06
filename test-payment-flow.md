# Stripe Payment Gateway Test Guide

## 1. Verify Your .env Configuration

Your `server/.env` file should contain:
```
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

**Important**: Both keys must be from the same Stripe account and environment (test/live).

## 2. Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy both keys from the same page:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
3. Add them to your `server/.env` file

## 3. Test Payment Flow

### Start Servers:
```bash
# Terminal 1 - Start backend
cd server
npm start

# Terminal 2 - Start frontend  
cd client
npm start
```

### Test Steps:
1. **Navigate to a course/scholarship** with an application fee
2. **Click "Apply Now"** 
3. **Fill out the application form**
4. **Click "Proceed to Payment"** - This should:
   - Open the PaymentModal popup
   - Show "Loading payment system..." briefly
   - Display Stripe card input fields

5. **Enter test card details**:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - Name: Any name

6. **Click "Pay Now"** - Should process successfully

## 4. Troubleshooting

### If payment modal doesn't appear:
- Check browser console for errors
- Verify server is running on port 5000
- Check network tab for failed API calls

### If "Loading payment system..." never ends:
- Server `.env` missing `STRIPE_PUBLISHABLE_KEY`
- Server not restarted after `.env` changes
- Network connection to `/api/payments/config` failing

### If payment fails:
- Keys are from different Stripe accounts
- Keys are test/live mismatch
- Invalid card details entered

## 5. Success Indicators

✅ **Payment Modal Opens**: Stripe card form appears
✅ **Card Input Works**: Can type in card fields
✅ **Payment Processes**: Success message appears
✅ **Application Created**: Check database for new application record
✅ **Payment Record**: Check database for payment record

## 6. Check Stripe Dashboard

After successful test payment:
1. Go to https://dashboard.stripe.com/test/payments
2. You should see the test payment listed
3. Amount should match your application fee

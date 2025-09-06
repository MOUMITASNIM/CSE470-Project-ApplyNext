const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  handlePaymentSuccess,
  getStripeConfig,
  getUserPayments,
  getAdminPayments
} = require('../controllers/paymentController');
const { protectUser } = require('../middleware/auth');

// Get Stripe configuration
router.get('/config', getStripeConfig);

// Payment routes
router.post('/create-intent', protectUser, createPaymentIntent);
router.post('/success', protectUser, handlePaymentSuccess);
router.get('/my-payments', protectUser, getUserPayments);

// Admin payment routes
router.get('/admin', getAdminPayments);

// Webhook endpoint for Stripe
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    // For now, just acknowledge the webhook
    console.log('Webhook received:', req.body);
    res.status(200).send('Webhook received');
  } catch (err) {
    console.log('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;

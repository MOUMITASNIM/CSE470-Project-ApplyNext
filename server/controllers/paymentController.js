const Payment = require('../models/Payment');
const Application = require('../models/Application');
const Course = require('../models/Course');
const Scholarship = require('../models/Scholarship');

// Initialize Stripe with secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { itemId, type, amount, currency } = req.body;
    const userId = req.user.id;

    console.log('Creating payment intent for:', { itemId, type, userId });

    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ 
        message: 'Stripe secret key not configured on server' 
      });
    }

    // Validate the item exists
    let item;
    if (type === 'course') {
      item = await Course.findById(itemId);
    } else {
      item = await Scholarship.findById(itemId);
    }
    
    if (!item) {
      return res.status(404).json({ message: `${type} not found` });
    }

    // Use the actual application fee from the item
    const actualAmount = item.applicationFee || 0;
    const actualCurrency = item.currency || 'USD';

    console.log('Payment details:', { actualAmount, actualCurrency, itemTitle: item.title });

    if (actualAmount <= 0) {
      return res.status(400).json({ message: 'Invalid application fee. Application fee must be greater than 0.' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(actualAmount * 100), // Convert to cents
      currency: actualCurrency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        itemId: itemId,
        userId: userId,
        type: type,
        itemTitle: item.title
      }
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: actualAmount,
      currency: actualCurrency,
      itemName: item.title,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create payment intent', 
      error: error.message
    });
  }
};

// Handle payment success
const handlePaymentSuccess = async (req, res) => {
  try {
    const { paymentIntentId, formData } = req.body;
    const userId = req.user.id;

    console.log('Processing payment success for:', { paymentIntentId, userId });

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('Retrieved payment intent:', paymentIntent.id, paymentIntent.status);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment has not succeeded yet' });
    }

    const { itemId, type } = paymentIntent.metadata;

    if (!itemId || !type) {
      return res.status(400).json({ message: 'Missing item information in payment metadata' });
    }

    // Create application after successful payment
    const applicationData = {
      user: userId,
      [type]: itemId,
      type, // explicitly store application type
      status: 'submitted',
      paymentStatus: 'paid',
      ...formData // Include form data if provided
    };

    let application;
    if (type === 'course') {
      application = new Application(applicationData);
    } else {
      // Use ScholarshipApplication model for scholarships
      try {
        const ScholarshipApplication = require('../models/ScholarshipApplication');
        application = new ScholarshipApplication(applicationData);
      } catch (modelError) {
        console.log('ScholarshipApplication model not found, using Application model');
        application = new Application(applicationData);
      }
    }

    await application.save();
    console.log('Application created:', application._id);

    // Create payment record
    const payment = new Payment({
      user: userId,
      [type]: itemId,
      application: application._id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      stripePaymentIntentId: paymentIntentId,
      status: 'completed',
      paidAt: new Date()
    });

    await payment.save();
    console.log('Payment record created:', payment._id);

    res.json({ 
      message: 'Payment processed successfully',
      applicationId: application._id,
      paymentId: payment._id
    });

  } catch (error) {
    console.error('Payment success error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to process payment success', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get Stripe publishable key
const getStripeConfig = async (req, res) => {
  try {
    if (!process.env.STRIPE_PUBLISHABLE_KEY) {
      return res.status(500).json({ 
        message: 'Stripe publishable key not configured on server' 
      });
    }

    console.log('Providing Stripe config to client');
    res.json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Get Stripe config error:', error);
    res.status(500).json({ message: 'Failed to get Stripe configuration', error: error.message });
  }
};

// Get user's payment history
const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('Fetching payments for user:', userId);
    
    const payments = await Payment.find({ user: userId })
      .populate('course', 'title university country applicationFee')
      .populate('scholarship', 'title university amount applicationFee')
      .populate('application', 'status createdAt')
      .sort({ createdAt: -1 });
    
    console.log('Found payments:', payments.length);
    
    res.json({
      success: true,
      payments: payments
    });
    
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch payment history', 
      error: error.message 
    });
  }
};

// Get all payments for admin (with pagination)
const getAdminPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    console.log('Fetching admin payments - page:', page, 'limit:', limit);
    
    const [payments, total] = await Promise.all([
      Payment.find({})
        .populate('user', 'firstName lastName email')
        .populate('course', 'title university country applicationFee')
        .populate('scholarship', 'title university amount applicationFee')
        .populate('application', 'status createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({})
    ]);
    
    console.log('Found admin payments:', payments.length, 'total:', total);
    
    res.json({
      success: true,
      data: {
        payments: payments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPayments: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get admin payments error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch admin payment history', 
      error: error.message 
    });
  }
};

module.exports = {
  createPaymentIntent,
  handlePaymentSuccess,
  getStripeConfig,
  getUserPayments,
  getAdminPayments
};

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship'
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: [true, 'Application is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    required: [true, 'Stripe Payment Intent ID is required']
  },
  stripeSessionId: {
    type: String
  },
  paymentMethod: {
    type: String,
    default: 'stripe'
  },
  transactionId: {
    type: String
  },
  failureReason: {
    type: String
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  paidAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ stripeSessionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

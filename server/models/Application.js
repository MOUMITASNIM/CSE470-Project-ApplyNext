const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  // For course applications
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  // For scholarship applications
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: false
  },
  // Application type to distinguish between course and scholarship
  type: {
    type: String,
    enum: ['course', 'scholarship'],
    required: false,
    default: 'course'
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'submitted', 'paid', 'approved', 'rejected', 'under_review'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'failed', 'refunded'],
    default: 'unpaid'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  firstName: {
    type: String,
    required: false,
    trim: true
  },
  lastName: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  nationality: {
    type: String,
    required: false,
    trim: true
  },
  education: {
    type: String,
    required: false,
    trim: true
  },
  currentUniversity: {
    type: String,
    trim: true
  },
  gpa: {
    type: Number,
    min: [0, 'GPA cannot be negative'],
    max: [4, 'GPA cannot be more than 4']
  },
  documents: [{
    name: String,
    url: String,
    type: String
  }],
  coverLetter: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  adminReviewer: {
    type: String,
    trim: true
  },
  reviewDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
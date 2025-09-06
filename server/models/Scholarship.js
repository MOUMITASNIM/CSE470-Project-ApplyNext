const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Scholarship title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Scholarship description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  university: {
    type: String,
    required: [true, 'University name is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Scholarship amount is required']
  },
  applicationFee: {
    type: Number,
    required: [true, 'Application fee is required'],
    min: [0, 'Application fee cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  image: {
    type: String,
    required: [true, 'Scholarship image is required']
  },
  universityLogo: {
    type: String,
    default: ''
  },
  requirements: [{
    type: String
  }],
  eligibility: [{
    type: String
  }],
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  startDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for search functionality
scholarshipSchema.index({ 
  title: 'text', 
  description: 'text', 
  university: 'text', 
  country: 'text' 
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);
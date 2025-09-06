const mongoose = require('mongoose');

const scholarshipApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: [true, 'Scholarship is required']
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
  // Basic personal info
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  nationality: { type: String, trim: true },
  passportNumber: { type: String, trim: true },

  // Education
  education: { type: String, trim: true },
  gpa: { type: Number, min: 0, max: 4 },
  transcripts: [{ name: String, url: String }],
  certificates: [{ name: String, url: String }],

  // Essays and documents
  essay: { type: String },
  recommendationLetters: [{ name: String, url: String }],
  resumeUrl: { type: String },

  // Financial need
  financialDocs: [{ name: String, url: String }],

  // Additional
  studyPlan: { type: String },
  offerLetterUrl: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('ScholarshipApplication', scholarshipApplicationSchema);

const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  sessionId: {
    type: String,
    required: [true, 'Session ID is required']
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: [true, 'Sender is required']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'quick_reply'],
      default: 'text'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatHistorySchema.index({ user: 1, isActive: 1 });
chatHistorySchema.index({ sessionId: 1 });
chatHistorySchema.index({ lastActivity: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);

const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getChatSession,
  getAllChatHistories,
  deleteChatSession
} = require('../controllers/chatController');
const { protectUser } = require('../middleware/auth');
const admin = require('../middleware/verifyAdmin');

// User routes
router.post('/message', protectUser, sendMessage);
router.get('/history', protectUser, getChatHistory);
router.get('/session/:sessionId', protectUser, getChatSession);
router.delete('/session/:sessionId', protectUser, deleteChatSession);

// Admin routes
router.get('/admin/all', protectUser, admin, getAllChatHistories);

module.exports = router;

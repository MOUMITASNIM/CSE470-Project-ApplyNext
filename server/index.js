const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { setupSecurity } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require('./routes/admin');
const courseRoutes = require('./routes/courses');
const scholarshipRoutes = require('./routes/scholarships');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Configure trust proxy for rate limiting
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy in production
} else {
  app.set('trust proxy', false); // Don't trust proxy in development
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('profileUpdated', (user) => {
    // Broadcast the update to all connected clients
    io.emit('profileUpdated', user);
  });

  socket.on('userUpdated', (user) => {
    // Broadcast the update to all connected clients
    io.emit('userUpdated', user);
  });

  socket.on('userDeleted', (userId) => {
    // Broadcast the deletion to all connected clients
    io.emit('userDeleted', userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Body parsing middleware (increase limits for base64 image uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Security middleware setup
setupSecurity(app);

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin/auth', adminAuthRoutes); // Admin authentication routes
app.use('/api/admin', adminRoutes); // Protected admin management routes
app.use('/api/courses', courseRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ApplyNext Platform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler (must be before error handler)
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 ApplyNext Platform API ready`);
  console.log(`🔒 Security features enabled`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 Socket.IO enabled`);
}); 
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const setupSecurity = (app) => {
  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Basic security headers with helmet
  app.use(helmet());

  // Rate limiting for APIs - more relaxed in development
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in development
    message: {
      success: false,
      message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use IP address directly in development to avoid proxy issues
    keyGenerator: (req) => {
      return process.env.NODE_ENV === 'production' 
        ? req.ip 
        : req.connection.remoteAddress || req.socket.remoteAddress || 'dev-user';
    }
  });

  // More relaxed limiter for auth routes to avoid blocking login
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 1000 : 5000, // Much higher in development
    standardHeaders: true,
    legacyHeaders: false,
    // Use IP address directly in development to avoid proxy issues
    keyGenerator: (req) => {
      return process.env.NODE_ENV === 'production' 
        ? req.ip 
        : req.connection.remoteAddress || req.socket.remoteAddress || 'dev-user';
    }
  });

  // Apply relaxed limiter to auth routes only
  app.use('/api/auth', authLimiter);

  // Apply stricter limiter to all other API routes
  app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/auth')) return next();
    return limiter(req, res, next);
  });

  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};

module.exports = { setupSecurity };

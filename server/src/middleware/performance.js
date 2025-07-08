const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Add request ID for tracking
  req.requestId = generateRequestId();
  
  // Add performance headers
  res.set('X-Request-ID', req.requestId);
  res.set('X-Powered-By', 'ADS-SaaS-Platform');
  
  // Track response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.requestId}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`[SLOW REQUEST] ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });
  
  next();
};

// Generate unique request ID
const generateRequestId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Advanced rate limiting with different tiers
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message || 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(windowMs / 1000),
        requestId: req.requestId
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimiters = {
  // General API rate limiting
  general: createRateLimiter(15 * 60 * 1000, 100, 'Too many requests'), // 100 requests per 15 minutes
  
  // Authentication endpoints (stricter)
  auth: createRateLimiter(15 * 60 * 1000, 20, 'Too many authentication attempts'), // 20 requests per 15 minutes
  
  // File upload endpoints (very strict)
  upload: createRateLimiter(60 * 60 * 1000, 10, 'Too many file uploads'), // 10 uploads per hour
  
  // Analytics endpoints (moderate)
  analytics: createRateLimiter(5 * 60 * 1000, 50, 'Too many analytics requests'), // 50 requests per 5 minutes
  
  // Critical operations (very strict)
  critical: createRateLimiter(60 * 60 * 1000, 5, 'Too many critical operations') // 5 requests per hour
};

// Compression middleware with optimal settings
const compressionMiddleware = compression({
  level: 6, // Optimal balance between compression and speed
  threshold: 1024, // Only compress responses over 1KB
  filter: (req, res) => {
    // Don't compress responses if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression for text-based responses
    return compression.filter(req, res);
  }
});

// Security headers with performance optimization
const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: {
    action: 'deny'
  },
  xssFilter: true
});

// CORS configuration with performance optimization
const corsMiddleware = cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'https://ads-saas.com',
      'https://www.ads-saas.com'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-Response-Time'],
  maxAge: 86400 // 24 hours
});

// Morgan logging configuration
const createLogger = () => {
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
  );
  
  // Custom format with performance metrics
  const customFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';
  
  return morgan(customFormat, {
    stream: accessLogStream,
    skip: (req, res) => {
      // Skip health checks and static files in logs
      return req.originalUrl === '/health' || req.originalUrl.startsWith('/_next/static');
    }
  });
};

// Memory usage monitoring
const memoryMonitoring = (req, res, next) => {
  const memUsage = process.memoryUsage();
  
  // Log memory usage if it's high
  if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
    console.warn(`[MEMORY WARNING] Heap usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  }
  
  // Add memory info to response headers in development
  if (process.env.NODE_ENV === 'development') {
    res.set('X-Memory-Usage', `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  }
  
  next();
};

// Response time tracking
const responseTimeMiddleware = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
  });
  
  next();
};

// Error handling with performance impact
const errorHandler = (err, req, res, next) => {
  // Log error with request context
  console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${err.message}`, {
    requestId: req.requestId,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    stack: err.stack
  });
  
  // Don't leak internal errors in production
  const isDev = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    error: isDev ? err.message : 'Internal server error',
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  };
  
  if (isDev) {
    errorResponse.stack = err.stack;
  }
  
  res.status(err.status || 500).json(errorResponse);
};

// Request sanitization middleware
const sanitizeMiddleware = (req, res, next) => {
  // Remove potentially harmful characters from query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].replace(/[<>]/g, '');
      }
    }
  }
  
  // Limit request body size
  if (req.body && JSON.stringify(req.body).length > 1024 * 1024) { // 1MB limit
    return res.status(413).json({
      error: 'Request body too large',
      requestId: req.requestId
    });
  }
  
  next();
};

// Health check optimization
const healthCheck = (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  };
  
  res.json(healthData);
};

module.exports = {
  performanceMiddleware,
  rateLimiters,
  compressionMiddleware,
  securityMiddleware,
  corsMiddleware,
  createLogger,
  memoryMonitoring,
  responseTimeMiddleware,
  errorHandler,
  sanitizeMiddleware,
  healthCheck
};
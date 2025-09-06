// 404 handler middleware
const notFound = (req, res, next) => {
  // Ignore common browser dev tools requests for source maps and other non-critical files
  const ignoredPaths = [
    '.map',
    'installHook.js',
    'favicon.ico',
    'robots.txt'
  ];
  
  const shouldIgnore = ignoredPaths.some(path => req.originalUrl.includes(path));
  
  if (shouldIgnore) {
    return res.status(404).end();
  }
  
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);

  // If response status is still 200 but there's an error, set it to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = { errorHandler, notFound };

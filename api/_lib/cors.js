/**
 * CORS Configuration
 * Restricts which domains can access the API
 */

// Allowed origins for production
const ALLOWED_ORIGINS = [
  'https://yadika-cup.vercel.app',
  'https://yadika-cup-basketball.vercel.app',
  'https://www.yadika-cup.com'
];

// Development origins
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

/**
 * CORS middleware
 * @param {Request} req
 * @param {Response} res
 * @returns {boolean} true if preflight request was handled
 */
export function cors(req, res) {
  const origin = req.headers?.origin;
  const isDev = process.env.NODE_ENV !== 'production';

  // Determine allowed origins based on environment
  const allowedOrigins = isDev
    ? [...ALLOWED_ORIGINS, ...DEV_ORIGINS]
    : ALLOWED_ORIGINS;

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For production, only allow specific origins
    // For development, be more permissive
    if (isDev) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    // In production with invalid origin, don't set CORS header (browser will block)
  }

  // Other CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}

import jwt from 'jsonwebtoken';

/**
 * Authentication middleware
 */
export function requireAuth(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yadika-cup-secret-key-2025');
    return decoded;
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
    return null;
  }
}

/**
 * Check if endpoint should be public
 */
export function isPublicEndpoint(req) {
  const publicEndpoints = [
    '/api/health',
    '/api/auth',
    '/api/schedule', // Live scores - public
    '/api/live-scores'      // Dedicated public endpoint
  ];

  // Allow GET requests to schedule (read-only)
  if (req.url.startsWith('/api/schedule') && req.method === 'GET') {
    return true;
  }

  return publicEndpoints.some(endpoint => req.url?.startsWith(endpoint));
}
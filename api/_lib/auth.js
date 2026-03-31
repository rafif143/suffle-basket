import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Authentication middleware using Supabase Auth
 */
export async function requireAuth(req, res) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided'
      });
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create client with user's token
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return null;
    }

    return user;
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
    return null;
  }
}

/**
 * Check if endpoint should be public (no auth required)
 */
export function isPublicEndpoint(req) {
  // Only these endpoints are public
  const publicEndpoints = [
    '/api/health',
  ];

  // Auth endpoint is only public for POST (login)
  if (req.url?.startsWith('/api/auth') && req.method === 'POST') {
    return true;
  }

  return publicEndpoints.some(endpoint => req.url?.startsWith(endpoint));
}

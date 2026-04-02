import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks to match both Vercel and local dev naming conventions
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

/**
 * Authentication middleware using Supabase Auth
 */
export async function requireAuth(req, res) {
  try {
    // Check for missing configuration
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase configuration missing on backend');
      res.status(500).json({
        success: false,
        message: 'Backend misconfiguration: Missing Supabase keys'
      });
      return null;
    }

    // Get token from Authorization header
    const headers = req.headers || {};
    const authHeader = headers.authorization || headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No authorization header found in request');
      res.status(401).json({
        success: false,
        message: 'No authorization token provided',
        error_code: 'MISSING_TOKEN'
      });
      return null;
    }

    const token = authHeader.split(' ')[1]; // Extract token after 'Bearer'

    if (!token || token === 'undefined' || token === 'null') {
      console.warn('⚠️ Invalid token string received in header:', token);
      res.status(401).json({
        success: false,
        message: 'Invalid authorization token string',
        error_code: 'INVALID_TOKEN_STRING'
      });
      return null;
    }

    // Create client with service role key to verify user's token
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.warn('⚠️ Token verification failed:', error?.message);
      res.status(401).json({
        success: false,
        message: error?.message || 'Invalid or expired token',
        error_code: error?.code
      });
      return null;
    }

    return user;
  } catch (error) {
    console.error('💥 Authentication process error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed: ' + (error.message || 'Unknown error')
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

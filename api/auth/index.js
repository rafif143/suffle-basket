import { cors } from '../_lib/cors.js';
import { supabase } from '../_lib/supabase.js';
import { loginSchema } from '../../src/lib/validators/schemas.js';

/**
 * Authentication endpoints using Supabase Auth
 * POST /api/auth?action=login - Login with Supabase Auth
 * GET /api/auth - Get current user session
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    const { action } = req.query;

    // Login
    if (req.method === 'POST' && action === 'login') {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const { email, password } = validation.data;

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({
          success: false,
          message: error.message || 'Invalid email or password'
        });
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || 'organizer',
          full_name: profile?.full_name || data.user.user_metadata?.full_name
        },
        session: data.session
      });
    }

    // Get current session
    if (req.method === 'GET') {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return res.status(401).json({
          success: false,
          message: 'No session found'
        });
      }

      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      return res.status(200).json({
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          role: profile?.role || 'organizer',
          full_name: profile?.full_name || session.user.user_metadata?.full_name
        },
        session: {
          expires_at: session.expires_at
        }
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

import { cors } from '../_lib/cors.js';
import { supabase } from '../_lib/supabase.js';
import bcrypt from 'bcryptjs';

/**
 * User registration endpoint
 * POST /api/auth/register - Register new admin/organizer
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    const { username, password, fullName, email, role = 'organizer' } = req.body;

    // Validation
    if (!username || !password || !fullName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, full name, and email are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (!['admin', 'organizer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either admin or organizer'
      });
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        username,
        password_hash: passwordHash,
        role,
        full_name: fullName,
        email,
        is_active: true
      }])
      .select('id, username, role, full_name, email, created_at')
      .single();

    if (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
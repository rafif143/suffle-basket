import { cors } from '../_lib/cors.js';
import { supabase } from '../_lib/supabase.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * Authentication endpoints
 * POST /api/auth?action=login - Login
 * POST /api/auth?action=register - Register
 * GET /api/auth - Verify token
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    const { action } = req.query;

    // Login
    if (req.method === 'POST' && action === 'login') {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        // Fallback to hardcoded credentials
        const validCredentials = [
          { username: 'admin', password: 'yadika2025', role: 'admin', full_name: 'System Administrator' },
          { username: 'panitia', password: 'tournament2025', role: 'organizer', full_name: 'Tournament Organizer' }
        ];

        const hardcodedUser = validCredentials.find(
          cred => cred.username === username && cred.password === password
        );

        if (!hardcodedUser) {
          return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
          });
        }

        const token = jwt.sign(
          { 
            username: hardcodedUser.username, 
            role: hardcodedUser.role,
            full_name: hardcodedUser.full_name,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
          },
          process.env.JWT_SECRET || 'yadika-cup-secret-key-2025'
        );

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            username: hardcodedUser.username,
            role: hardcodedUser.role,
            full_name: hardcodedUser.full_name
          }
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      const token = jwt.sign(
        { 
          id: user.id,
          username: user.username, 
          role: user.role,
          full_name: user.full_name,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        },
        process.env.JWT_SECRET || 'yadika-cup-secret-key-2025'
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          full_name: user.full_name,
          email: user.email
        }
      });
    }

    // Register
    if (req.method === 'POST' && action === 'register') {
      const { username, password, fullName, email, role = 'organizer' } = req.body;

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

      const passwordHash = await bcrypt.hash(password, 10);

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
    }

    // Verify token
    if (req.method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yadika-cup-secret-key-2025');
        
        return res.status(200).json({
          success: true,
          user: {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
            full_name: decoded.full_name,
            email: decoded.email
          }
        });
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

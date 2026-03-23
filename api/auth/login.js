import { cors } from '../_lib/cors.js';
import { supabase } from '../_lib/supabase.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * Authentication endpoints
 * POST /api/auth/login - Login with database
 * GET /api/auth/login - Verify token
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    if (req.method === 'POST') {
      // Login with database
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
        // Fallback to hardcoded credentials if no database user found
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

        // Generate JWT token for hardcoded user
        const token = jwt.sign(
          { 
            username: hardcodedUser.username, 
            role: hardcodedUser.role,
            full_name: hardcodedUser.full_name,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
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

      // Verify password for database user
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Generate JWT token for database user
      const token = jwt.sign(
        { 
          id: user.id,
          username: user.username, 
          role: user.role,
          full_name: user.full_name,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
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

    if (req.method === 'GET') {
      // Verify token
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
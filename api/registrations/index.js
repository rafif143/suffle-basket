import { supabase } from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';

/**
 * Registrations endpoint
 * GET /api/registrations - Get all
 * POST /api/registrations - Create new
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    if (req.method === 'GET') {
      // Get all registrations
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data
      });
    }

    if (req.method === 'POST') {
      // Create registration
      const { schoolName, schoolAddress, whatsapp, level, gender, players, officials } = req.body;

      const registrationData = {
        school_name: schoolName,
        school_address: schoolAddress,
        whatsapp,
        level,
        gender,
        logo_url: null, // File upload handled separately
        players: players.map(p => ({ name: p.name, card_url: null })),
        officials,
        status: 'Pending'
      };

      const { data, error } = await supabase
        .from('registrations')
        .insert([registrationData])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Registration created successfully',
        data
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

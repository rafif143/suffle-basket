import { supabase } from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';

/**
 * GET /api/registrations/stats
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { data, error } = await supabase
      .from('registrations')
      .select('status');

    if (error) throw error;

    const stats = {
      total: data.length,
      pending: data.filter(r => r.status === 'Pending').length,
      verified: data.filter(r => r.status === 'Verified').length,
      rejected: data.filter(r => r.status === 'Rejected').length
    };

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

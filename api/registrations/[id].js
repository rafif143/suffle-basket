import { supabase } from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';

/**
 * Registration by ID
 * GET /api/registrations/[id] - Get by ID
 * PATCH /api/registrations/[id] - Update status
 * DELETE /api/registrations/[id] - Delete
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    }

    if (req.method === 'PATCH') {
      const { status } = req.body;

      const { data, error } = await supabase
        .from('registrations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Status updated successfully',
        data
      });
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Registration deleted successfully'
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

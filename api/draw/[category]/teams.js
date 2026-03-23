import { supabase } from '../../_lib/supabase.js';
import { cors } from '../../_lib/cors.js';

/**
 * Teams by category
 * GET /api/draw/[category]/teams - Get teams
 * POST /api/draw/[category]/teams - Save teams
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  const { category } = req.query;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('category', category)
        .order('order_index', { ascending: true });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data.map(t => t.team_name)
      });
    }

    if (req.method === 'POST') {
      const { teams } = req.body;

      if (!Array.isArray(teams) || teams.length > 16) {
        return res.status(400).json({
          success: false,
          message: 'Invalid teams data'
        });
      }

      // Delete existing teams
      await supabase.from('teams').delete().eq('category', category);

      // Insert new teams
      const teamsData = teams.map((teamName, index) => ({
        category,
        team_name: teamName,
        order_index: index
      }));

      const { error } = await supabase
        .from('teams')
        .insert(teamsData);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Teams saved successfully'
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

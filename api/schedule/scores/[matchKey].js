import { supabase } from '../../_lib/supabase.js';
import { cors } from '../../_lib/cors.js';

/**
 * Score by match key
 * GET /api/schedule/scores/[matchKey] - Get score
 * DELETE /api/schedule/scores/[matchKey] - Delete score
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  const { matchKey } = req.query;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('match_scores')
        .select('*')
        .eq('match_key', matchKey)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Score not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          score1: data.score1,
          score2: data.score2
        }
      });
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('match_scores')
        .delete()
        .eq('match_key', matchKey);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Score deleted successfully'
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

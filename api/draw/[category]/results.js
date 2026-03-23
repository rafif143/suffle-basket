import { supabase } from '../../_lib/supabase.js';
import { cors } from '../../_lib/cors.js';

/**
 * Draw results by category
 * GET /api/draw/[category]/results - Get results
 * POST /api/draw/[category]/results - Save results
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  const { category } = req.query;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('draw_results')
        .select('*')
        .eq('category', category)
        .order('match_index', { ascending: true });

      if (error) throw error;

      const formattedResults = data.map(r => ({
        team1: r.team1,
        team2: r.team2
      }));

      return res.status(200).json({
        success: true,
        data: formattedResults.length > 0 ? formattedResults : Array(8).fill({ team1: '?', team2: '?' })
      });
    }

    if (req.method === 'POST') {
      const { results } = req.body;

      if (!Array.isArray(results)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid results data'
        });
      }

      // Delete existing results
      await supabase.from('draw_results').delete().eq('category', category);

      // Insert new results
      const resultsData = results.map((match, index) => ({
        category,
        match_index: index,
        team1: match.team1,
        team2: match.team2
      }));

      const { error } = await supabase
        .from('draw_results')
        .insert(resultsData);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Draw results saved successfully'
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

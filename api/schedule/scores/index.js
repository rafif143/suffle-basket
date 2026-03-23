import { supabase } from '../../_lib/supabase.js';
import { cors } from '../../_lib/cors.js';

/**
 * Match scores
 * GET /api/schedule/scores - Get all scores
 * POST /api/schedule/scores - Save score
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('match_scores')
        .select('*');

      if (error) throw error;

      // Convert to object format
      const scoresObject = {};
      data.forEach(score => {
        scoresObject[score.match_key] = {
          score1: score.score1,
          score2: score.score2
        };
      });

      return res.status(200).json({
        success: true,
        data: scoresObject
      });
    }

    if (req.method === 'POST') {
      const { matchKey, score1, score2 } = req.body;

      const { data, error } = await supabase
        .from('match_scores')
        .upsert({
          match_key: matchKey,
          score1: parseInt(score1),
          score2: parseInt(score2),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'match_key'
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Score saved successfully',
        data: {
          score1: data.score1,
          score2: data.score2
        }
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

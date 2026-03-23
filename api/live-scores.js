import { supabase } from './_lib/supabase.js';
import { cors } from './_lib/cors.js';

/**
 * Public Live Scores endpoint (NO AUTH REQUIRED)
 * GET /api/live-scores - Get live match scores for public display
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    // Get all match scores
    const { data, error } = await supabase
      .from('match_scores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format for public consumption
    const liveScores = data.map(score => {
      const [day, matchId, category] = score.match_key.split('-');
      return {
        day: parseInt(day),
        matchId,
        category,
        team1Score: score.score1,
        team2Score: score.score2,
        isComplete: score.score1 !== null && score.score2 !== null,
        lastUpdated: score.updated_at
      };
    });

    // Group by day for easier consumption
    const groupedByDay = {};
    liveScores.forEach(match => {
      if (!groupedByDay[match.day]) {
        groupedByDay[match.day] = [];
      }
      groupedByDay[match.day].push(match);
    });

    return res.status(200).json({
      success: true,
      data: {
        matches: liveScores,
        byDay: groupedByDay,
        totalMatches: liveScores.length,
        completedMatches: liveScores.filter(m => m.isComplete).length,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Live scores error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch live scores'
    });
  }
}
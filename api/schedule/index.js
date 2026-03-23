import { supabase } from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';

/**
 * Schedule API
 * GET /api/schedule - Get all schedule data from draw_results
 * GET /api/schedule?scores=true - Get all scores
 * GET /api/schedule?matchKey=xxx - Get specific score
 * POST /api/schedule - Save score (PROTECTED)
 * DELETE /api/schedule?matchKey=xxx - Delete score (PROTECTED)
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  const { scores, matchKey } = req.query;

  // Check authentication for non-GET requests
  if (req.method !== 'GET') {
    const { requireAuth } = await import('../_lib/auth.js');
    const user = requireAuth(req, res);
    if (!user) return;
  }

  try {
    if (req.method === 'GET') {
      // Get all scores
      if (scores === 'true') {
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

      // Get specific match score
      if (matchKey) {
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
      // Get all draw results
      const { data: drawResults, error } = await supabase
        .from('draw_results')
        .select('*')
        .order('category')
        .order('match_index');

      if (error) throw error;

      const scheduleData = [];
      let matchId = 1;

      // Category mapping
      const categories = {
        'sma-putra': { level: 'SMA', gender: 'Putra', dayOffset: 0 },
        'sma-putri': { level: 'SMA', gender: 'Putri', dayOffset: 0 },
        'smp-putra': { level: 'SMP', gender: 'Putra', dayOffset: 1 },
        'smp-putri': { level: 'SMP', gender: 'Putri', dayOffset: 1 }
      };

      // Time slots
      const getMatchTime = (matchIndex) => {
        const times = [
          '15:30 - 16:30',
          '16:30 - 17:30', 
          '17:30 - 18:30',
          '19:00 - 20:00',
          '20:00 - 21:00'
        ];
        return times[(matchIndex - 1) % times.length];
      };

      // Create schedule from draw results
      drawResults.forEach(draw => {
        const catInfo = categories[draw.category];
        if (!catInfo) return;

        const day = catInfo.dayOffset + Math.floor((draw.match_index - 1) / 4) + 1;
        
        const scheduleMatch = {
          id: matchId++,
          day: day,
          matchStrId: `M${String(draw.match_index).padStart(2, '0')}`,
          round: 'Round of 16',
          level: catInfo.level,
          gender: catInfo.gender,
          category: `${catInfo.level} ${catInfo.gender}`,
          team1: draw.team1,
          team2: draw.team2,
          time: getMatchTime(draw.match_index),
          match_key: `${day}-M${String(draw.match_index).padStart(2, '0')}-${draw.category}`
        };
        
        scheduleData.push(scheduleMatch);
      });

      return res.status(200).json({
        success: true,
        data: scheduleData
      });
    }

    if (req.method === 'POST') {
      const { matchKey: bodyMatchKey, score1, score2 } = req.body;

      const { data, error } = await supabase
        .from('match_scores')
        .upsert({
          match_key: bodyMatchKey,
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
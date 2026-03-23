import { supabase } from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';

/**
 * Schedule API
 * GET /api/schedule - Get all schedule data from draw_results
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    if (req.method === 'GET') {
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
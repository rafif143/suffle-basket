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

      // Category mapping - stagger to fill ~6 matches per day
      const categories = {
        'sma-putra': { level: 'SMA', gender: 'Putra', dayOffset: 0 },   // Day 1-2
        'sma-putri': { level: 'SMA', gender: 'Putri', dayOffset: 1 },   // Day 2-3 (starts on day 2)
        'smp-putra': { level: 'SMP', gender: 'Putra', dayOffset: 3 },   // Day 4-5
        'smp-putri': { level: 'SMP', gender: 'Putri', dayOffset: 4 }    // Day 5-6
      };

      // Time slots - 6 matches per day for Round of 16
      const getMatchTime = (matchIndex) => {
        const times = [
          '15:00 - 16:00',
          '16:00 - 17:00', 
          '17:00 - 18:00',
          '18:00 - 19:00',
          '19:00 - 20:00',
          '20:00 - 21:00'
        ];
        return times[(matchIndex - 1) % times.length];
      };

      // Create schedule from draw results with custom day assignment
      drawResults.forEach(draw => {
        const catInfo = categories[draw.category];
        if (!catInfo) return;

        let day;
        const matchIdx = draw.match_index;

        // Custom day assignment to balance ~6 matches per day (32 total matches)
        if (draw.category === 'sma-putra') {
          // Day 1: M1-M6 (6 matches)
          // Day 2: M7-M8 (2 matches)
          day = matchIdx <= 6 ? 1 : 2;
        } else if (draw.category === 'sma-putri') {
          // Day 2: M1-M4 (4 matches) - fills day 2 to 6 total
          // Day 3: M5-M8 (4 matches)
          day = matchIdx <= 4 ? 2 : 3;
        } else if (draw.category === 'smp-putra') {
          // Day 3: M1-M2 (2 matches) - fills day 3 to 6 total
          // Day 4: M3-M8 (6 matches)
          day = matchIdx <= 2 ? 3 : 4;
        } else if (draw.category === 'smp-putri') {
          // Day 5: M1-M6 (6 matches)
          // Day 6: M7-M8 (2 matches)
          day = matchIdx <= 6 ? 5 : 6;
        }
        
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

      // Generate bracket matches for Quarter Finals (8 Besar), Semi Finals, and Finals
      const bracketMatches = [];
      let bracketMatchId = matchId;

      // Quarter Finals (8 Besar) - Day 7-10
      const quarterFinals = [
        // Day 7 - SMA
        { day: 7, category: 'SMA Putra', level: 'SMA', gender: 'Putra', matchNum: 1, time: '15:00 - 16:00', team1: 'Winner M1', team2: 'Winner M2', from1: 'M1', from2: 'M2' },
        { day: 7, category: 'SMA Putra', level: 'SMA', gender: 'Putra', matchNum: 2, time: '16:00 - 17:00', team1: 'Winner M3', team2: 'Winner M4', from1: 'M3', from2: 'M4' },
        { day: 7, category: 'SMA Putri', level: 'SMA', gender: 'Putri', matchNum: 1, time: '17:00 - 18:00', team1: 'Winner M1', team2: 'Winner M2', from1: 'M1', from2: 'M2' },
        { day: 7, category: 'SMA Putri', level: 'SMA', gender: 'Putri', matchNum: 2, time: '18:00 - 19:00', team1: 'Winner M3', team2: 'Winner M4', from1: 'M3', from2: 'M4' },
        
        // Day 8 - SMA continued
        { day: 8, category: 'SMA Putra', level: 'SMA', gender: 'Putra', matchNum: 3, time: '15:00 - 16:00', team1: 'Winner M5', team2: 'Winner M6', from1: 'M5', from2: 'M6' },
        { day: 8, category: 'SMA Putra', level: 'SMA', gender: 'Putra', matchNum: 4, time: '16:00 - 17:00', team1: 'Winner M7', team2: 'Winner M8', from1: 'M7', from2: 'M8' },
        { day: 8, category: 'SMA Putri', level: 'SMA', gender: 'Putri', matchNum: 3, time: '17:00 - 18:00', team1: 'Winner M5', team2: 'Winner M6', from1: 'M5', from2: 'M6' },
        { day: 8, category: 'SMA Putri', level: 'SMA', gender: 'Putri', matchNum: 4, time: '18:00 - 19:00', team1: 'Winner M7', team2: 'Winner M8', from1: 'M7', from2: 'M8' },
        
        // Day 9 - SMP
        { day: 9, category: 'SMP Putra', level: 'SMP', gender: 'Putra', matchNum: 1, time: '15:00 - 16:00', team1: 'Winner M1', team2: 'Winner M2', from1: 'M1', from2: 'M2' },
        { day: 9, category: 'SMP Putra', level: 'SMP', gender: 'Putra', matchNum: 2, time: '16:00 - 17:00', team1: 'Winner M3', team2: 'Winner M4', from1: 'M3', from2: 'M4' },
        { day: 9, category: 'SMP Putri', level: 'SMP', gender: 'Putri', matchNum: 1, time: '17:00 - 18:00', team1: 'Winner M1', team2: 'Winner M2', from1: 'M1', from2: 'M2' },
        { day: 9, category: 'SMP Putri', level: 'SMP', gender: 'Putri', matchNum: 2, time: '18:00 - 19:00', team1: 'Winner M3', team2: 'Winner M4', from1: 'M3', from2: 'M4' },
        
        // Day 10 - SMP continued
        { day: 10, category: 'SMP Putra', level: 'SMP', gender: 'Putra', matchNum: 3, time: '15:00 - 16:00', team1: 'Winner M5', team2: 'Winner M6', from1: 'M5', from2: 'M6' },
        { day: 10, category: 'SMP Putra', level: 'SMP', gender: 'Putra', matchNum: 4, time: '16:00 - 17:00', team1: 'Winner M7', team2: 'Winner M8', from1: 'M7', from2: 'M8' },
        { day: 10, category: 'SMP Putri', level: 'SMP', gender: 'Putri', matchNum: 3, time: '17:00 - 18:00', team1: 'Winner M5', team2: 'Winner M6', from1: 'M5', from2: 'M6' },
        { day: 10, category: 'SMP Putri', level: 'SMP', gender: 'Putri', matchNum: 4, time: '18:00 - 19:00', team1: 'Winner M7', team2: 'Winner M8', from1: 'M7', from2: 'M8' },
      ];

      quarterFinals.forEach(qf => {
        bracketMatches.push({
          id: bracketMatchId++,
          day: qf.day,
          matchStrId: `QF${qf.matchNum}`,
          round: '8 Besar',
          level: qf.level,
          gender: qf.gender,
          category: qf.category,
          team1: qf.team1,
          team2: qf.team2,
          time: qf.time,
          match_key: `${qf.day}-QF${qf.matchNum}-${qf.category.toLowerCase().replace(' ', '-')}`
        });
      });

      // Semi Finals - Day 11-12
      const semiFinals = [
        // Day 11 - SMA
        { day: 11, category: 'SMA Putra', level: 'SMA', gender: 'Putra', matchNum: 1, time: '15:00 - 16:00', team1: 'Winner QF1', team2: 'Winner QF2' },
        { day: 11, category: 'SMA Putra', level: 'SMA', gender: 'Putra', matchNum: 2, time: '16:00 - 17:00', team1: 'Winner QF3', team2: 'Winner QF4' },
        { day: 11, category: 'SMA Putri', level: 'SMA', gender: 'Putri', matchNum: 1, time: '17:00 - 18:00', team1: 'Winner QF1', team2: 'Winner QF2' },
        { day: 11, category: 'SMA Putri', level: 'SMA', gender: 'Putri', matchNum: 2, time: '18:00 - 19:00', team1: 'Winner QF3', team2: 'Winner QF4' },
        
        // Day 12 - SMP
        { day: 12, category: 'SMP Putra', level: 'SMP', gender: 'Putra', matchNum: 1, time: '15:00 - 16:00', team1: 'Winner QF1', team2: 'Winner QF2' },
        { day: 12, category: 'SMP Putra', level: 'SMP', gender: 'Putra', matchNum: 2, time: '16:00 - 17:00', team1: 'Winner QF3', team2: 'Winner QF4' },
        { day: 12, category: 'SMP Putri', level: 'SMP', gender: 'Putri', matchNum: 1, time: '17:00 - 18:00', team1: 'Winner QF1', team2: 'Winner QF2' },
        { day: 12, category: 'SMP Putri', level: 'SMP', gender: 'Putri', matchNum: 2, time: '18:00 - 19:00', team1: 'Winner QF3', team2: 'Winner QF4' },
      ];

      semiFinals.forEach(sf => {
        bracketMatches.push({
          id: bracketMatchId++,
          day: sf.day,
          matchStrId: `SF${sf.matchNum}`,
          round: 'Semi Final',
          level: sf.level,
          gender: sf.gender,
          category: sf.category,
          team1: sf.team1,
          team2: sf.team2,
          time: sf.time,
          match_key: `${sf.day}-SF${sf.matchNum}-${sf.category.toLowerCase().replace(' ', '-')}`
        });
      });

      // Finals - Day 13
      const finals = [
        { day: 13, category: 'SMA Putra', level: 'SMA', gender: 'Putra', time: '15:00 - 16:00', team1: 'Winner SF1', team2: 'Winner SF2' },
        { day: 13, category: 'SMA Putri', level: 'SMA', gender: 'Putri', time: '16:00 - 17:00', team1: 'Winner SF1', team2: 'Winner SF2' },
        { day: 13, category: 'SMP Putra', level: 'SMP', gender: 'Putra', time: '17:00 - 18:00', team1: 'Winner SF1', team2: 'Winner SF2' },
        { day: 13, category: 'SMP Putri', level: 'SMP', gender: 'Putri', time: '18:00 - 19:00', team1: 'Winner SF1', team2: 'Winner SF2' },
      ];

      finals.forEach(f => {
        bracketMatches.push({
          id: bracketMatchId++,
          day: f.day,
          matchStrId: 'F1',
          round: 'Final',
          level: f.level,
          gender: f.gender,
          category: f.category,
          team1: f.team1,
          team2: f.team2,
          time: f.time,
          match_key: `${f.day}-F1-${f.category.toLowerCase().replace(' ', '-')}`
        });
      });

      // Combine all matches
      scheduleData.push(...bracketMatches);

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
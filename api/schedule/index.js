import { supabase } from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { scoreSchema } from '../../src/lib/validators/schemas.js';

/**
 * Schedule API
 * GET /api/schedule - Get all schedule data from draw_results
 * GET /api/schedule?scores=true - Get all scores
 * GET /api/schedule?matchKey=xxx - Get specific score
 * POST /api/schedule - Save score (PROTECTED)
 * DELETE /api/schedule?matchKey=xxx - Delete score (PROTECTED)
 * POST /api/schedule?action=refresh-winners - Manually refresh winners (PROTECTED)
 */

/**
 * Generate consistent match_key for all rounds
 * Format: {day}-{roundPrefix}{match_number}-{category}
 * Examples: "1-M01-sma-putra", "7-QF1-sma-putra", "11-SF1-sma-putra", "13-F1-sma-putra"
 */
function generateMatchKey(day, round, match_number, category) {
  let prefix;
  if (round === '16 Besar') {
    prefix = `M${String(match_number).padStart(2, '0')}`;
  } else if (round === '8 Besar') {
    prefix = `QF${match_number}`;
  } else if (round === 'Semi Final') {
    prefix = `SF${match_number}`;
  } else if (round === 'Final') {
    prefix = 'F1';
  } else {
    prefix = `M${String(match_number).padStart(2, '0')}`;
  }
  return `${day}-${prefix}-${category}`;
}

/**
 * Get match reference string from team1_from/team2_from
 * This handles the conversion: "M01" → find match with match_number=1 in 16 Besar
 */
function findSourceMatch(matches, sourceRef, category) {
  return matches.find(sm => {
    if (sm.category !== category) return false;

    // Parse sourceRef (e.g., "M01", "QF1", "SF1")
    const match = sourceRef.match(/^([A-Z]+)(\d+)$/);
    if (!match) {
      console.warn(`Invalid sourceRef format: ${sourceRef}`);
      return false;
    }

    const [, prefix, numStr] = match;
    const num = parseInt(numStr);

    // Match based on prefix and round
    if (prefix === 'M' && sm.round === '16 Besar') {
      return sm.match_number === num;
    } else if (prefix === 'QF' && sm.round === '8 Besar') {
      return sm.match_number === num;
    } else if (prefix === 'SF' && sm.round === 'Semi Final') {
      return sm.match_number === num;
    }

    return false;
  });
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const { scores, matchKey } = req.query;

  try {
    // Check authentication only for mutation methods (POST, DELETE) or when specific actions are requested
    if (req.method !== 'GET' || req.query.action) {
      const { requireAuth } = await import('../_lib/auth.js');
      const user = await requireAuth(req, res);
      if (!user) return; // Auth failed, response already sent
    }

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

      // Filter out empty draws (where team1 or team2 is '?' or null)
      const validDrawResults = drawResults.filter(draw => 
        draw.team1 && draw.team2 && 
        draw.team1 !== '?' && draw.team2 !== '?' &&
        draw.team1 !== 'TBD' && draw.team2 !== 'TBD'
      );

      // 1. Fetch existing matches from the 'matches' table
      let { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('day')
        .order('match_number');

      if (matchesError) throw matchesError;

      // 2. If no matches found, initialize them from allDrawResults and hardcoded logic
      if (!matches || matches.length === 0) {
        const initialMatches = [];

        // Match counts per day (for time slot calculation)
        const matchesPerDayCount = {
          1: 5, 2: 5, 3: 5, 4: 5,  // Days 1-4: 5 matches each (start 15:00)
          5: 6, 6: 6,              // Days 5-6: 6 matches each (start 14:00)
          7: 4, 8: 4, 9: 4, 10: 4, // Days 7-10: 4 matches each (start 15:00)
          11: 4, 12: 4, 13: 4      // Days 11-13: 4 matches each (start 15:00)
        };

        // Time slots helper - different start times based on match count per day
        // 6 matches/day: 14:00, 15:00, 16:00, (break), 18:00, 19:00, 20:00
        // <6 matches/day: 15:00, 16:00, (break), 18:00, 19:00, 20:00
        const getMatchTime = (day, indexInDay) => {
          const totalInDay = matchesPerDayCount[day] || 5;
          // If 6 matches: start at 14:00, else start at 15:00
          const startHour = totalInDay >= 6 ? 14 : 15;
          
          // Time slots with 1 hour break after match 3 (index 2)
          const times = [];
          for (let i = 0; i < totalInDay; i++) {
            let hour = startHour + i;
            // Add 1 hour break after match 3 (index 2)
            if (i >= 3) hour += 1;
            times.push(`${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`);
          }
          return times[indexInDay];
        };

        // Fetch draw results for Round of 16 (16 Besar)
        const { data: allDrawResults } = await supabase.from('draw_results').select('*');
        const drawMap = {};
        allDrawResults?.forEach(d => {
          if (!drawMap[d.category]) drawMap[d.category] = {};
          drawMap[d.category][d.match_index] = d;
        });

        const getTeamsForR16 = (category, matchIdx) => {
          const draw = drawMap[category] ? drawMap[category][matchIdx] : null;
          return {
            team1: draw?.team1 || 'TBD',
            team2: draw?.team2 || 'TBD'
          };
        };

        const createMatch = (day, matchNum, round, level, gender, category, team1 = 'TBD', team2 = 'TBD', t1From = null, t2From = null) => {
          const dayMatches = initialMatches.filter(m => m.day === day);
          initialMatches.push({
            category,
            round,
            match_number: matchNum,
            day,
            match_time: getMatchTime(day, dayMatches.length),
            team1: team1 === '?' ? 'TBD' : team1,
            team2: team2 === '?' ? 'TBD' : team2,
            team1_from: t1From,
            team2_from: t2From,
            status: 'Not Play Yet'
          });
        };

        // Helper to define 16 Besar (R16)
        const addR16 = (day, matchIdx, category) => {
          const parts = category.split('-');
          const { team1, team2 } = getTeamsForR16(category, matchIdx);
          createMatch(day, matchIdx + 1, '16 Besar', parts[0].toUpperCase(), parts[1], category, team1, team2);
        };

        // Day 1: SMA (5 matches)
        addR16(1, 0, 'sma-putra'); addR16(1, 1, 'sma-putra'); addR16(1, 2, 'sma-putra');
        addR16(1, 0, 'sma-putri'); addR16(1, 1, 'sma-putri');

        // Day 2: SMP (5 matches)
        addR16(2, 0, 'smp-putra'); addR16(2, 1, 'smp-putra'); addR16(2, 2, 'smp-putra');
        addR16(2, 0, 'smp-putri'); addR16(2, 1, 'smp-putri');

        // Day 3: SMA QF (5 matches)
        addR16(3, 3, 'sma-putra'); addR16(3, 4, 'sma-putra');
        addR16(3, 2, 'sma-putri'); addR16(3, 3, 'sma-putri'); addR16(3, 4, 'sma-putri');

        // Day 4: SMP QF (5 matches)
        addR16(4, 3, 'smp-putra'); addR16(4, 4, 'smp-putra');
        addR16(4, 2, 'smp-putri'); addR16(4, 3, 'smp-putri'); addR16(4, 4, 'smp-putri');

        // Day 5: SMA (6 matches)
        addR16(5, 5, 'sma-putra'); addR16(5, 6, 'sma-putra'); addR16(5, 7, 'sma-putra');
        addR16(5, 5, 'sma-putri'); addR16(5, 6, 'sma-putri'); addR16(5, 7, 'sma-putri');

        // Day 6: SMP (6 matches)
        addR16(6, 5, 'smp-putra'); addR16(6, 6, 'smp-putra'); addR16(6, 7, 'smp-putra');
        addR16(6, 5, 'smp-putri'); addR16(6, 6, 'smp-putri'); addR16(6, 7, 'smp-putri');

        // Bracket rounds (8 Besar onwards)
        const addBracket = (day, round, level, gender, matchNum, category) => {
          let t1F, t2F;
          if (round === '8 Besar') {
            t1F = `M${String((matchNum - 1) * 2 + 1).padStart(2, '0')}`;
            t2F = `M${String((matchNum - 1) * 2 + 2).padStart(2, '0')}`;
          } else if (round === 'Semi Final') {
            t1F = matchNum === 1 ? 'QF1' : 'QF3';
            t2F = matchNum === 1 ? 'QF2' : 'QF4';
          } else if (round === 'Final') {
            t1F = 'SF1'; t2F = 'SF2';
          }
          createMatch(day, matchNum, round, level, gender, category, 'TBD', 'TBD', t1F, t2F);
        };

        // Day 7: SMA QF
        addBracket(7, '8 Besar', 'SMA', 'Putra', 1, 'sma-putra');
        addBracket(7, '8 Besar', 'SMA', 'Putra', 2, 'sma-putra');
        addBracket(7, '8 Besar', 'SMA', 'Putri', 1, 'sma-putri');
        addBracket(7, '8 Besar', 'SMA', 'Putri', 2, 'sma-putri');
        
        // Day 8: SMP QF
        addBracket(8, '8 Besar', 'SMP', 'Putra', 1, 'smp-putra');
        addBracket(8, '8 Besar', 'SMP', 'Putra', 2, 'smp-putra');
        addBracket(8, '8 Besar', 'SMP', 'Putri', 1, 'smp-putri');
        addBracket(8, '8 Besar', 'SMP', 'Putri', 2, 'smp-putri');

        // Day 9: SMA QF
        addBracket(9, '8 Besar', 'SMA', 'Putra', 3, 'sma-putra');
        addBracket(9, '8 Besar', 'SMA', 'Putra', 4, 'sma-putra');
        addBracket(9, '8 Besar', 'SMA', 'Putri', 3, 'sma-putri');
        addBracket(9, '8 Besar', 'SMA', 'Putri', 4, 'sma-putri');

        // Day 10: SMP QF
        addBracket(10, '8 Besar', 'SMP', 'Putra', 3, 'smp-putra');
        addBracket(10, '8 Besar', 'SMP', 'Putra', 4, 'smp-putra');
        addBracket(10, '8 Besar', 'SMP', 'Putri', 3, 'smp-putri');
        addBracket(10, '8 Besar', 'SMP', 'Putri', 4, 'smp-putri');

        // Day 11: SMA SF
        addBracket(11, 'Semi Final', 'SMA', 'Putra', 1, 'sma-putra');
        addBracket(11, 'Semi Final', 'SMA', 'Putra', 2, 'sma-putra');
        addBracket(11, 'Semi Final', 'SMA', 'Putri', 1, 'sma-putri');
        addBracket(11, 'Semi Final', 'SMA', 'Putri', 2, 'sma-putri');

        // Day 12: SMP SF
        addBracket(12, 'Semi Final', 'SMP', 'Putra', 1, 'smp-putra');
        addBracket(12, 'Semi Final', 'SMP', 'Putra', 2, 'smp-putra');
        addBracket(12, 'Semi Final', 'SMP', 'Putri', 1, 'smp-putri');
        addBracket(12, 'Semi Final', 'SMP', 'Putri', 2, 'smp-putri');

        // Day 13: Finals
        addBracket(13, 'Final', 'SMP', 'Putri', 1, 'smp-putri');
        addBracket(13, 'Final', 'SMP', 'Putra', 1, 'smp-putra');
        addBracket(13, 'Final', 'SMA', 'Putri', 1, 'sma-putri');
        addBracket(13, 'Final', 'SMA', 'Putra', 1, 'sma-putra');

        // Bulk insert matches
        const { data: inserted, error: insertError } = await supabase.from('matches').insert(initialMatches).select();
        if (insertError) throw insertError;
        matches = inserted;
      }

      // 3. Resolve winners for progressive rounds
      const { data: scoresData } = await supabase.from('match_scores').select('*');
      const scoresMap = {};
      scoresData?.forEach(s => { scoresMap[s.match_key] = s; });

      /**
       * Get winner of a source match reference
       * @param {string} sourceRef - e.g., "M01", "QF1", "SF1"
       * @param {string} category - e.g., "sma-putra"
       * @returns {string|null} - Winner team name or null if no winner yet
       */
      const getWinnerOf = (sourceRef, cat) => {
        const sourceMatch = findSourceMatch(matches, sourceRef, cat);
        if (!sourceMatch) {
          console.warn(`Source match not found: ${sourceRef} for ${cat}`);
          return null;
        }

        // Generate the correct match_key for the source match
        const sourceKey = generateMatchKey(
          sourceMatch.day, 
          sourceMatch.round, 
          sourceMatch.match_number, 
          sourceMatch.category
        );
        
        const score = scoresMap[sourceKey];
        if (!score) {
          console.log(`No score found for ${sourceKey} (looking for winner of ${sourceRef})`);
          return null;
        }
        if (score.score1 === score.score2) {
          console.log(`Score is draw for ${sourceKey}: ${score.score1}-${score.score2}`);
          return null;
        }
        
        const winner = score.score1 > score.score2 ? sourceMatch.team1 : sourceMatch.team2;
        console.log(`Winner of ${sourceRef} (${sourceKey}): ${winner} (score: ${score.score1}-${score.score2})`);
        return winner;
      };

      const scheduleData = matches.map(m => {
        const level = m.category.split('-')[0].toUpperCase();
        const gender = m.category.split('-')[1].charAt(0).toUpperCase() + m.category.split('-')[1].slice(1);
        const matchStrId = m.round === '16 Besar' ? `M${String(m.match_number).padStart(2, '0')}` :
                          m.round === '8 Besar' ? `QF${m.match_number}` :
                          m.round === 'Semi Final' ? `SF${m.match_number}` : 'F1';

        // Use consistent match_key generation
        const matchKey = generateMatchKey(m.day, m.round, m.match_number, m.category);

        let team1 = m.team1;
        let team2 = m.team2;

        // Resolve winners from previous matches
        if (m.team1_from) {
          console.log(`🔍 Resolving ${m.round} ${matchStrId} (${m.category}): team1_from = ${m.team1_from}`);
          const winner = getWinnerOf(m.team1_from, m.category);
          console.log(`   → Winner: ${winner}`);
          team1 = winner || `Winner ${m.team1_from}`;
        }
        if (m.team2_from) {
          const winner = getWinnerOf(m.team2_from, m.category);
          console.log(`   → Winner: ${winner}`);
          team2 = winner || `Winner ${m.team2_from}`;
        }

        return {
          id: m.id,
          day: m.day,
          match_number: m.match_number,
          matchStrId,
          round: m.round,
          level,
          gender,
          category: `${level} ${gender}`,
          team1,
          team2,
          time: m.match_time,
          match_key: matchKey,
          team1_from: m.team1_from,
          team2_from: m.team2_from,
          isReadyToPlay: team1 !== 'TBD' && team2 !== 'TBD' && !team1.startsWith('Winner ') && !team2.startsWith('Winner ')
        };
      });

      return res.status(200).json({
        success: true,
        data: scheduleData
      });
    }

    if (req.method === 'POST') {
      // Handle refresh-winners action
      if (req.query.action === 'refresh-winners') {
        return res.status(200).json({
          success: true,
          message: 'Winner refresh triggered. Refetch schedule to see updates.'
        });
      }

      // Validate score input
      const validation = scoreSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const { matchKey: bodyMatchKey, score1, score2 } = validation.data;

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

      if (error) {
        console.error('Database error saving score:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to save score: ' + error.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Score saved successfully',
        data: {
          score1: data.score1,
          score2: data.score2,
          match_key: data.match_key
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
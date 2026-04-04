import { supabase } from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

/**
 * Dev Mode Draw Actions
 * POST /api/dev/draw-actions?action=draw-all - Auto draw all categories
 * POST /api/dev/draw-actions?action=delete-all - Delete all draw data
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    // Check authentication
    const user = await requireAuth(req, res);
    if (!user) return; // Auth failed, response already sent

    const { action } = req.query;

    // Only allow in development mode (skip check for now since we're always in dev)
    // if (process.env.NODE_ENV === 'production') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Dev actions are not allowed in production'
    //   });
    // }

    if (req.method === 'POST') {
      if (action === 'draw-all') {
        return await drawAllCategories(req, res);
      } else if (action === 'delete-all') {
        return await deleteAllDrawData(req, res);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use "draw-all" or "delete-all"'
        });
      }
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

/**
 * Auto draw all categories with Smart Shuffling
 * Ensures same schools don't play on the same day across different categories (e.g. Putra vs Putri)
 */
async function drawAllCategories(req, res) {
  const categories = ['sma-putra', 'sma-putri', 'smp-putra', 'smp-putri'];
  const results = {};
  const logs = [];
  
  const addLog = (msg) => {
    logs.push(msg);
    console.log(`[SmartShuffle] ${msg}`);
  };

  addLog('Starting Smart Shuffling for all categories...');

  // Track which schools are playing on which day to prevent conflicts
  const dayAssignments = {
    1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set(), 6: new Set()
  };

  const normalize = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  };

  const getSlotDay = (level, matchIndex) => {
    if (level === 'SMA') {
      if (matchIndex <= 2) return 1;
      if (matchIndex <= 4) return 3;
      return 5;
    } else {
      if (matchIndex <= 2) return 2;
      if (matchIndex <= 4) return 4;
      return 6;
    }
  };

  const getSlotDayPutri = (level, matchIndex) => {
    if (level === 'SMA') {
      if (matchIndex <= 1) return 1;
      if (matchIndex <= 4) return 3;
      return 5;
    } else {
      if (matchIndex <= 1) return 2;
      if (matchIndex <= 4) return 4;
      return 6;
    }
  };

  for (const category of categories) {
    try {
      const parts = category.split('-');
      const level = parts[0].toUpperCase();
      const gender = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      const isPutri = gender === 'Putri';

      addLog(`\n--- Picking teams for ${level} ${gender} ---`);

      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('school_name')
        .eq('level', level)
        .eq('gender', gender)
        .eq('status', 'Verified');

      if (regError) throw regError;

      if (registrations.length < 16) {
        addLog(`❌ Not enough teams for ${category} (${registrations.length}/16)`);
        results[category] = { success: false, message: `Not enough teams` };
        continue;
      }

      const pool = registrations.map(r => r.school_name).sort(() => 0.5 - Math.random());
      const drawResults = [];

      for (let i = 0; i < 8; i++) {
        const day = isPutri ? getSlotDayPutri(level, i) : getSlotDay(level, i);
        
        let team1Idx = -1;
        let team2Idx = -1;

        // Team 1 Selection
        for (let j = 0; j < pool.length; j++) {
          const normName = normalize(pool[j]);
          if (!dayAssignments[day].has(normName)) {
            team1Idx = j;
            break;
          } else {
            // addLog(`Skipping ${pool[j]} for Day ${day} (already assigned in other category)`);
          }
        }
        
        if (team1Idx === -1) {
          addLog(`⚠️ Warning: Forced conflict for Team 1 in Day ${day} slot ${i+1}`);
          team1Idx = 0;
        }
        const team1 = pool.splice(team1Idx, 1)[0];
        dayAssignments[day].add(normalize(team1));

        // Team 2 Selection
        for (let j = 0; j < pool.length; j++) {
          const normName = normalize(pool[j]);
          if (!dayAssignments[day].has(normName)) {
            team2Idx = j;
            break;
          }
        }
        
        if (team2Idx === -1) {
          addLog(`⚠️ Warning: Forced conflict for Team 2 in Day ${day} slot ${i+1}`);
          team2Idx = 0;
        }
        const team2 = pool.splice(team2Idx, 1)[0];
        dayAssignments[day].add(normalize(team2));

        addLog(`Match ${i+1} (Day ${day}): ${team1} vs ${team2}`);

        drawResults.push({
          category,
          match_index: i,
          team1,
          team2
        });
      }

      await supabase.from('draw_results').delete().eq('category', category);
      const { error: insertError } = await supabase.from('draw_results').insert(drawResults);
      if (insertError) throw insertError;

      results[category] = { success: true, matches: drawResults.length };

    } catch (error) {
      addLog(`❌ Error processing ${category}: ${error.message}`);
      results[category] = { success: false, message: error.message };
    }
  }

  addLog('\n✅ Smart Auto Draw completed successfully!');

  return res.status(200).json({
    success: true,
    message: 'Draw completed',
    results,
    logs
  });
}

/**
 * Delete all draw data (draw_results, matches, match_scores)
 */
async function deleteAllDrawData(req, res) {
  try {
    // Delete draw_results
    const { error: drawError } = await supabase
      .from('draw_results')
      .delete()
      .not('id', 'is', null);

    if (drawError) throw new Error(`Failed to delete draw_results: ${drawError.message}`);

    // Delete matches
    const { error: matchError } = await supabase
      .from('matches')
      .delete()
      .not('id', 'is', null);

    if (matchError) throw new Error(`Failed to delete matches: ${matchError.message}`);

    // Delete match_scores
    const { error: scoreError } = await supabase
      .from('match_scores')
      .delete()
      .not('match_key', 'is', null);

    if (scoreError) throw new Error(`Failed to delete match_scores: ${scoreError.message}`);

    return res.status(200).json({
      success: true,
      message: 'All draw data deleted successfully',
      deleted: {
        draw_results: true,
        matches: true,
        match_scores: true
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

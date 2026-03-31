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
 * Auto draw all categories
 */
async function drawAllCategories(req, res) {
  const categories = ['sma-putra', 'sma-putri', 'smp-putra', 'smp-putri'];
  const results = {};

  for (const category of categories) {
    try {
      // Parse category
      const parts = category.split('-');
      const level = parts[0].toUpperCase();
      const gender = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);

      // Get verified registrations for this category
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('school_name')
        .eq('level', level)
        .eq('gender', gender)
        .eq('status', 'Verified');

      if (regError) throw regError;

      if (registrations.length < 16) {
        results[category] = {
          success: false,
          message: `Not enough teams (${registrations.length}/16)`
        };
        continue;
      }

      // Shuffle teams
      const teams = registrations.map(r => r.school_name);
      const shuffled = [...teams].sort(() => 0.5 - Math.random());

      // Create 8 matches
      const drawResults = [];
      for (let i = 0; i < 8; i++) {
        drawResults.push({
          category: category,
          match_index: i,
          team1: shuffled[i * 2],
          team2: shuffled[i * 2 + 1]
        });
      }

      // Delete existing draw results
      await supabase
        .from('draw_results')
        .delete()
        .eq('category', category);

      // Insert new draw results
      const { error: insertError } = await supabase
        .from('draw_results')
        .insert(drawResults);

      if (insertError) throw insertError;

      results[category] = {
        success: true,
        matches: drawResults.length
      };

    } catch (error) {
      results[category] = {
        success: false,
        message: error.message
      };
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Auto draw completed',
    results
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

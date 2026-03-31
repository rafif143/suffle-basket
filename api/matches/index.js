/**
 * Matches API - Handle all tournament matches with round information
 * GET /api/matches - Get all matches
 * GET /api/matches?id=X - Get single match
 * GET /api/matches?category=sma-putra&round=16%20Besar - Get filtered matches
 * POST /api/matches - Create new match
 * PUT /api/matches?id=X - Update match
 * DELETE /api/matches?id=X - Delete match
 */

import { supabase } from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  // Handle CORS
  if (cors(req, res)) {
    return;
  }

  const { id } = req.query;

  try {
    // Check authentication only for mutation methods
    if (req.method !== 'GET') {
      const user = await requireAuth(req, res);
      if (!user) return; // Auth failed, response already sent
    }

    if (req.method === 'GET') {
      if (id) {
        return await getMatch(req, res, id);
      }
      return await getMatches(req, res);
    } else if (req.method === 'POST') {
      return await createMatch(req, res);
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      if (!id) {
        return res.status(400).json({ success: false, error: 'Match ID is required' });
      }
      return await updateMatch(req, res, id);
    } else if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ success: false, error: 'Match ID is required' });
      }
      return await deleteMatch(req, res, id);
    } else {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Matches API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function getMatch(req, res, id) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ success: false, error: 'Match not found' });
    }
    console.error('Database error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
  
  cors(req, res);
  res.status(200).json({ success: true, data });
}

async function getMatches(req, res) {
  const { category, round, day } = req.query;
  
  let query = supabase.from('matches').select('*');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (round) {
    query = query.eq('round', round);
  }
  
  if (day) {
    query = query.eq('day', parseInt(day));
  }
  
  query = query.order('day').order('match_number');
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Database error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
  
  cors(req, res);
  return res.status(200).json({ success: true, data: data || [] });
}

async function createMatch(req, res) {
  const { 
    category, 
    round, 
    match_number, 
    day, 
    match_time, 
    team1, 
    team2, 
    team1_from, 
    team2_from 
  } = req.body;
  
  if (!category || !round || !match_number || !day || !match_time || !team1 || !team2) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: category, round, match_number, day, match_time, team1, team2' 
    });
  }
  
  const { data, error } = await supabase
    .from('matches')
    .insert([{
      category,
      round,
      match_number,
      day,
      match_time,
      team1,
      team2,
      team1_from,
      team2_from,
      status: 'Not Play Yet'
    }])
    .select();
  
  if (error) {
    console.error('Database error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
  
  cors(req, res);
  return res.status(201).json({ success: true, data: data[0] });
}

async function updateMatch(req, res, id) {
  const updates = req.body;
  
  // Validate allowed fields
  const allowedFields = [
    'team1', 'team2', 'team1_from', 'team2_from', 
    'status', 'day', 'match_time', 'round'
  ];
  
  const updateData = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  }
  
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ success: false, error: 'No valid fields to update' });
  }
  
  updateData.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('matches')
    .update(updateData)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Database error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
  
  if (!data || data.length === 0) {
    return res.status(404).json({ success: false, error: 'Match not found' });
  }
  
  cors(req, res);
  res.status(200).json({ success: true, data: data[0] });
}

async function deleteMatch(req, res, id) {
  const { data, error } = await supabase
    .from('matches')
    .delete()
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Database error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
  
  if (!data || data.length === 0) {
    return res.status(404).json({ success: false, error: 'Match not found' });
  }
  
  cors(req, res);
  res.status(200).json({ success: true, message: 'Match deleted successfully' });
}
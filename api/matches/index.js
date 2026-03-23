/**
 * Matches API - Handle all tournament matches with round information
 * GET /api/matches - Get all matches
 * GET /api/matches?category=sma-putra&round=16%20Besar - Get filtered matches
 * POST /api/matches - Create new match
 * PUT /api/matches/:id - Update match
 */

import { supabase } from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';

export default async function handler(req, res) {
  // Handle CORS
  if (cors(req, res)) {
    return;
  }

  try {
    if (req.method === 'GET') {
      return await getMatches(req, res);
    } else if (req.method === 'POST') {
      return await createMatch(req, res);
    } else {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Matches API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
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
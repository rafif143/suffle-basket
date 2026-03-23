/**
 * Single Match API - Handle individual match operations
 * GET /api/matches/:id - Get single match
 * PUT /api/matches/:id - Update match (including status)
 * DELETE /api/matches/:id - Delete match
 */

import { supabase } from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';

export default async function handler(req, res) {
  // Handle CORS
  if (cors(req, res)) {
    return;
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ success: false, error: 'Match ID is required' });
  }

  try {
    if (req.method === 'GET') {
      return await getMatch(req, res, id);
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      return await updateMatch(req, res, id);
    } else if (req.method === 'DELETE') {
      return await deleteMatch(req, res, id);
    } else {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Match API error:', error);
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
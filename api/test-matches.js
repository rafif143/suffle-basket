/**
 * Simple test endpoint for matches (PROTECTED)
 */

import { requireAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  // Check authentication
  const user = await requireAuth(req, res);
  if (!user) return; // Auth failed, response already sent

  try {
    res.status(200).json({ 
      success: true, 
      message: 'Test matches endpoint working',
      method: req.method,
      query: req.query
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
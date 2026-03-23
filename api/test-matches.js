/**
 * Simple test endpoint for matches
 */

export default async function handler(req, res) {
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
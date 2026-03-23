/**
 * Health check endpoint
 * GET /api/health
 */
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
}

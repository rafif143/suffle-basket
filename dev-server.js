import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import API handlers
let handlers;
try {
  handlers = {
    health: (await import('./api/health.js')).default,
    auth: (await import('./api/auth/index.js')).default,
    registrations: (await import('./api/registrations/index.js')).default,
    drawResults: (await import('./api/draw/[category]/results.js')).default,
    schedule: (await import('./api/schedule/index.js')).default,
    matches: (await import('./api/matches/index.js')).default,
    settings: (await import('./api/settings.js')).default,
    devDrawActions: (await import('./api/dev/draw-actions.js')).default
  };
  console.log('✅ All API handlers loaded successfully');
} catch (error) {
  console.error('❌ Error loading API handlers:', error);
  process.exit(1);
}

// Routes
app.all('/api/health', handlers.health);

// Auth routes
app.all('/api/auth', handlers.auth);

// Public routes

// Protected routes
app.all('/api/registrations', handlers.registrations);

app.all('/api/draw/:category/results', (req, res) => {
  const mockReq = { ...req, query: { category: req.params.category } };
  handlers.drawResults(mockReq, res);
});

app.all('/api/schedule', handlers.schedule);
app.all('/api/matches', handlers.matches);
app.all('/api/settings', handlers.settings);
app.all('/api/dev/draw-actions', handlers.devDrawActions);

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║        🚀 BACKEND API SERVER          ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                            ║
║   API:  http://localhost:${PORT}/api       ║
║   Status: ✅ Ready for requests        ║
╚════════════════════════════════════════╝
  `);
});

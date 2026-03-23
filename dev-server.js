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
    authLogin: (await import('./api/auth/login.js')).default,
    authRegister: (await import('./api/auth/register.js')).default,
    liveScores: (await import('./api/live-scores.js')).default,
    registrations: (await import('./api/registrations/index.js')).default,
    registrationsStats: (await import('./api/registrations/stats.js')).default,
    registrationsById: (await import('./api/registrations/[id].js')).default,
    drawTeams: (await import('./api/draw/[category]/teams.js')).default,
    drawResults: (await import('./api/draw/[category]/results.js')).default,
    schedule: (await import('./api/schedule/index.js')).default,
    scheduleScores: (await import('./api/schedule/scores/index.js')).default,
    settings: (await import('./api/settings.js')).default
  };
  console.log('✅ All API handlers loaded successfully');
} catch (error) {
  console.error('❌ Error loading API handlers:', error);
  process.exit(1);
}

// Routes
app.all('/api/health', handlers.health);

// Auth routes
app.all('/api/auth/login', handlers.authLogin);
app.all('/api/auth/register', handlers.authRegister);

// Public routes
app.all('/api/live-scores', handlers.liveScores);

// Protected routes
app.all('/api/registrations/stats', handlers.registrationsStats);
app.all('/api/registrations/:id', (req, res) => {
  const mockReq = { ...req, query: { id: req.params.id } };
  handlers.registrationsById(mockReq, res);
});
app.all('/api/registrations', handlers.registrations);

app.all('/api/draw/:category/teams', (req, res) => {
  const mockReq = { ...req, query: { category: req.params.category } };
  handlers.drawTeams(mockReq, res);
});

app.all('/api/draw/:category/results', (req, res) => {
  const mockReq = { ...req, query: { category: req.params.category } };
  handlers.drawResults(mockReq, res);
});

app.all('/api/schedule', handlers.schedule);
app.all('/api/schedule/scores', handlers.scheduleScores);

app.all('/api/settings', handlers.settings);

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

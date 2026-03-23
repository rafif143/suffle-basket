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
const handlers = {
  health: (await import('./api/health.js')).default,
  registrations: (await import('./api/registrations/index.js')).default,
  registrationsStats: (await import('./api/registrations/stats.js')).default,
  registrationsById: (await import('./api/registrations/[id].js')).default,
  drawTeams: (await import('./api/draw/[category]/teams.js')).default,
  drawResults: (await import('./api/draw/[category]/results.js')).default,
  scheduleScores: (await import('./api/schedule/scores/index.js')).default,
  scheduleScoresByKey: (await import('./api/schedule/scores/[matchKey].js')).default,
  settings: (await import('./api/settings.js')).default
};

// Routes
app.all('/api/health', handlers.health);
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

app.all('/api/schedule/scores/:matchKey', (req, res) => {
  const mockReq = { ...req, query: { matchKey: req.params.matchKey } };
  handlers.scheduleScoresByKey(mockReq, res);
});
app.all('/api/schedule/scores', handlers.scheduleScores);

app.all('/api/settings', handlers.settings);

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Dev API Server (Vercel Simulation)  ║
╠════════════════════════════════════════╣
║   Port: ${PORT}
║   API: http://localhost:${PORT}/api
╚════════════════════════════════════════╝
  `);
});

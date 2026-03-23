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

console.log('🔄 Starting simple backend server...');

// Simple test route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running!' });
});

// Import and setup API handlers one by one
try {
  console.log('📦 Loading API handlers...');
  
  // Load health handler
  const healthHandler = (await import('./api/health.js')).default;
  app.all('/api/health', healthHandler);
  console.log('✅ Health handler loaded');

  // Load auth handlers
  const authLoginHandler = (await import('./api/auth/login.js')).default;
  app.all('/api/auth/login', authLoginHandler);
  console.log('✅ Auth login handler loaded');

  const authRegisterHandler = (await import('./api/auth/register.js')).default;
  app.all('/api/auth/register', authRegisterHandler);
  console.log('✅ Auth register handler loaded');

  // Load registrations handler
  const registrationsHandler = (await import('./api/registrations/index.js')).default;
  app.all('/api/registrations', registrationsHandler);
  console.log('✅ Registrations handler loaded');

  // Load draw results handler
  const drawResultsHandler = (await import('./api/draw/[category]/results.js')).default;
  app.all('/api/draw/:category/results', (req, res) => {
    const mockReq = { ...req, query: { category: req.params.category } };
    drawResultsHandler(mockReq, res);
  });
  console.log('✅ Draw results handler loaded');

  // Load schedule handler
  const scheduleHandler = (await import('./api/schedule/index.js')).default;
  app.all('/api/schedule', scheduleHandler);
  console.log('✅ Schedule handler loaded');

  // Load schedule scores handler
  const scheduleScoresHandler = (await import('./api/schedule/scores/index.js')).default;
  app.all('/api/schedule/scores', scheduleScoresHandler);
  console.log('✅ Schedule scores handler loaded');

  // Load settings handler
  const settingsHandler = (await import('./api/settings.js')).default;
  app.all('/api/settings', settingsHandler);
  console.log('✅ Settings handler loaded');

  // Load registrations stats handler
  const registrationsStatsHandler = (await import('./api/registrations/stats.js')).default;
  app.all('/api/registrations/stats', registrationsStatsHandler);
  console.log('✅ Registrations stats handler loaded');

  // Load registrations by ID handler
  const registrationsByIdHandler = (await import('./api/registrations/[id].js')).default;
  app.all('/api/registrations/:id', (req, res) => {
    const mockReq = { ...req, query: { id: req.params.id } };
    registrationsByIdHandler(mockReq, res);
  });
  console.log('✅ Registrations by ID handler loaded');

  // Load matches handler
  const matchesHandler = (await import('./api/matches/index.js')).default;
  app.all('/api/matches', matchesHandler);
  console.log('✅ Matches handler loaded');

  // Load matches by ID handler
  const matchesByIdHandler = (await import('./api/matches/[id].js')).default;
  app.all('/api/matches/:id', (req, res) => {
    const mockReq = { ...req, query: { id: req.params.id } };
    matchesByIdHandler(mockReq, res);
  });
  console.log('✅ Matches by ID handler loaded');

  // Load test matches handler
  const testMatchesHandler = (await import('./api/test-matches.js')).default;
  app.all('/api/test-matches', testMatchesHandler);
  console.log('✅ Test matches handler loaded');

  console.log('🎉 All handlers loaded successfully!');

} catch (error) {
  console.error('❌ Error loading handlers:', error);
  process.exit(1);
}

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
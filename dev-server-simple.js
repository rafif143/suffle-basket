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
  const authHandler = (await import('./api/auth/index.js')).default;
  app.all('/api/auth', authHandler);
  console.log('✅ Auth handler loaded');

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

  // Load schedule handler (includes scores)
  const scheduleHandler = (await import('./api/schedule/index.js')).default;
  app.all('/api/schedule', scheduleHandler);
  console.log('✅ Schedule handler loaded');

  // Load settings handler
  const settingsHandler = (await import('./api/settings.js')).default;
  app.all('/api/settings', settingsHandler);
  console.log('✅ Settings handler loaded');

  // Load registrations handler
  const registrationsHandler = (await import('./api/registrations/index.js')).default;
  app.all('/api/registrations', registrationsHandler);
  console.log('✅ Registrations handler loaded');
    registrationsByIdHandler(mockReq, res);
  });

  // Load matches handler
  const matchesHandler = (await import('./api/matches/index.js')).default;
  app.all('/api/matches', matchesHandler);
  console.log('✅ Matches handler loaded');

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
/**
 * Tournament Constants
 * Centralized constants for the tournament system
 */

// Tournament Structure
export const MATCHES_PER_ROUND = 8;
export const TOTAL_DAYS = 13;
export const CATEGORIES = ['sma-putra', 'sma-putri', 'smp-putra', 'smp-putri'];
export const CATEGORY_LABELS = ['All', 'SMA Putra', 'SMA Putri', 'SMP Putra', 'SMP Putri'];

// Test Scores (for auto-fill testing)
export const TEST_SCORES = {
  R16: { home: 25, away: 15 },      // 16 Besar
  QF: { home: 28, away: 20 },       // 8 Besar (Quarter Final)
  SF: { home: 35, away: 27 },       // Semi Final
  FINAL: { home: 40, away: 30 },    // Final
};

// Pagination
export const PAGE_SIZE = 10;

// Match Status
export const MATCH_STATUS = {
  NOT_PLAY_YET: 'Not Play Yet',
  COMPLETE: 'Complete',
};

// Registration Status
export const REGISTRATION_STATUS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

// Round Names
export const ROUNDS = {
  R16: '16 Besar',
  QF: '8 Besar',
  SF: 'Semi Final',
  FINAL: 'Final',
};

// Time Slots (for match scheduling)
export const TIME_SLOTS = [
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
];

// Cache Settings
export const CACHE_TTL = 300000; // 5 minutes

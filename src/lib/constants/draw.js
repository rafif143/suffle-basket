/**
 * Draw Constants
 * Constants for tournament draw functionality
 */

// Draw configuration
export const MATCHES_PER_CATEGORY = 8;
export const CATEGORIES = {
  SMA_PUTRA: 'sma-putra',
  SMA_PUTRI: 'sma-putri',
  SMP_PUTRA: 'smp-putra',
  SMP_PUTRI: 'smp-putri',
};

export const CATEGORY_LABELS = {
  'sma-putra': 'SMA Putra',
  'sma-putri': 'SMA Putri',
  'smp-putra': 'SMP Putra',
  'smp-putri': 'SMP Putri',
};

export const LEVELS = ['SMA', 'SMP'];
export const GENDERS = ['Putra', 'Putri'];

// Shuffle animation
export const SHUFFLE_DURATION = 2500; // ms
export const SHUFFLE_INTERVAL = 80; // ms

// Draw placeholder
export const DRAW_PLACEHOLDER = { team1: '?', team2: '?' };
export const DRAW_EMPTY_ARRAY = Array(MATCHES_PER_CATEGORY).fill(DRAW_PLACEHOLDER);

// Dev mode actions
export const DEV_ACTIONS = {
  DRAW_ALL: 'draw-all',
  DELETE_ALL: 'delete-all',
};

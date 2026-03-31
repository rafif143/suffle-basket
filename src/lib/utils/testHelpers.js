/**
 * Test Helpers
 * Auto-fill scores for testing tournament flow
 */

import { scheduleService } from '$lib/services';
import { TEST_SCORES, ROUNDS } from '$lib/constants/tournament';

/**
 * Generate match key consistently
 * @param {Object} match - Match object
 * @returns {string} Match key (e.g., "7-QF1-sma-putra")
 */
export function generateMatchKey(match) {
  const day = match.day;
  const round = match.round;
  const match_number = match.match_number || match.matchStrId?.replace(/[A-Z]/g, '');

  let prefix;
  if (round === ROUNDS.R16) {
    prefix = `M${String(match_number).padStart(2, '0')}`;
  } else if (round === ROUNDS.QF) {
    prefix = `QF${match_number}`;
  } else if (round === ROUNDS.SF) {
    prefix = `SF${match_number}`;
  } else if (round === ROUNDS.FINAL) {
    prefix = 'F1';
  } else {
    prefix = `M${String(match_number).padStart(2, '0')}`;
  }

  return `${day}-${prefix}-${match.category.toLowerCase().replace(' ', '-')}`;
}

/**
 * Auto-fill scores for a specific round
 * @param {Array} matches - Array of match objects
 * @param {string} round - Round name (16 Besar, 8 Besar, etc.)
 * @param {Object} scores - Score configuration { home, away }
 * @returns {Object} Result { successCount, failCount }
 */
export async function autoFillRoundScores(matches, round, scores) {
  const roundMatches = matches.filter((m) => m.round === round);

  if (roundMatches.length === 0) {
    return { successCount: 0, failCount: 0, message: `No ${round} matches found` };
  }

  let successCount = 0;
  let failCount = 0;

  for (const match of roundMatches) {
    const scoreKey = generateMatchKey(match);
    const s1 = match.match_number % 2 === 0 ? scores.home : scores.away;
    const s2 = match.match_number % 2 === 0 ? scores.away : scores.home;

    try {
      await scheduleService.saveScore(scoreKey, s1, s2);
      successCount++;
    } catch (err) {
      failCount++;
      console.error(`Failed to save score for ${scoreKey}:`, err.message);
    }
  }

  return {
    successCount,
    failCount,
    message: `Successfully saved ${successCount} scores${failCount > 0 ? ` (${failCount} failed)` : ''}`,
  };
}

/**
 * Test helper for 16 Besar round
 */
export async function test16Besar(matches) {
  return autoFillRoundScores(matches, ROUNDS.R16, TEST_SCORES.R16);
}

/**
 * Test helper for 8 Besar (Quarter Final) round
 */
export async function test8Besar(matches) {
  return autoFillRoundScores(matches, ROUNDS.QF, TEST_SCORES.QF);
}

/**
 * Test helper for Semi Final round
 */
export async function testSemiFinal(matches) {
  return autoFillRoundScores(matches, ROUNDS.SF, TEST_SCORES.SF);
}

/**
 * Test helper for Final round
 */
export async function testFinal(matches) {
  return autoFillRoundScores(matches, ROUNDS.FINAL, TEST_SCORES.FINAL);
}

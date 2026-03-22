/**
 * Schedule Service
 * Handles all schedule-related operations
 * Ready to be replaced with API calls
 */

import { storage } from '$lib/utils/storage.js';

export const scheduleService = {
	/**
	 * Get match scores
	 */
	getScores() {
		return storage.get('match_scores') || {};
	},

	/**
	 * Save match score
	 */
	saveScore(matchKey, score) {
		const scores = this.getScores();
		scores[matchKey] = score;
		storage.set('match_scores', scores);
	},

	/**
	 * Get score for a specific match
	 */
	getMatchScore(match) {
		const scoreKey = `${match.day}-${match.matchStrId}-${match.category}`;
		const scores = this.getScores();
		return scores[scoreKey];
	},

	/**
	 * Check if match is complete
	 */
	isMatchComplete(match) {
		const score = this.getMatchScore(match);
		return score && score.score1 !== '' && score.score2 !== '';
	}
};

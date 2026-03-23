/**
 * Schedule Service
 * Handles all schedule-related operations via API
 */

import { apiClient } from '$lib/api/client.js';

export const scheduleService = {
	cachedScores: {},

	/**
	 * Get match scores
	 */
	async getScores() {
		const response = await apiClient.get('/schedule?scores=true');
		this.cachedScores = response.data;
		return response.data;
	},

	/**
	 * Save match score
	 */
	async saveScore(matchKey, score1, score2) {
		await apiClient.post('/schedule', {
			matchKey,
			score1: parseInt(score1),
			score2: parseInt(score2)
		});
	},

	/**
	 * Get score for a specific match
	 */
	getMatchScore(match) {
		const scoreKey = `${match.day}-${match.matchStrId}-${match.category}`;
		return this.cachedScores[scoreKey];
	},

	/**
	 * Check if match is complete
	 */
	isMatchComplete(match) {
		const score = this.getMatchScore(match);
		return score && score.score1 !== '' && score.score2 !== '';
	}
};

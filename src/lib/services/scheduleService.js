/**
 * Schedule Service
 * Handles all schedule-related operations via API
 */

import { apiClient } from '$lib/api/client.js';

/**
 * Generate consistent match_key for all rounds
 * Format: {day}-{roundPrefix}{match_number}-{category}
 * Examples: "1-M01-sma-putra", "7-QF1-sma-putra", "11-SF1-sma-putra", "13-F1-sma-putra"
 */
function generateMatchKey(match) {
	const day = match.day;
	const round = match.round;
	const match_number = match.match_number || match.matchStrId?.replace(/[A-Z]/g, '');
	
	let prefix;
	if (round === '16 Besar') {
		prefix = `M${String(match_number).padStart(2, '0')}`;
	} else if (round === '8 Besar') {
		prefix = `QF${match_number}`;
	} else if (round === 'Semi Final') {
		prefix = `SF${match_number}`;
	} else if (round === 'Final') {
		prefix = 'F1';
	} else {
		prefix = `M${String(match_number).padStart(2, '0')}`;
	}
	
	return `${day}-${prefix}-${match.category.toLowerCase().replace(' ', '-')}`;
}

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
	 * Get all schedule data
	 */
	async getSchedule() {
		const response = await apiClient.get('/schedule');
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
		const scoreKey = generateMatchKey(match);
		return this.cachedScores[scoreKey];
	},

	/**
	 * Check if match is complete
	 */
	isMatchComplete(match) {
		const score = this.getMatchScore(match);
		return score && score.score1 !== undefined && score.score2 !== undefined;
	}
};

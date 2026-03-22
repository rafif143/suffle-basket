/**
 * Draw Service
 * Handles all draw-related operations
 * Ready to be replaced with API calls
 */

import { storage } from '$lib/utils/storage.js';

export const drawService = {
	/**
	 * Get teams for a specific category
	 */
	getTeams(category) {
		return storage.get(`teams_${category}`) || [];
	},

	/**
	 * Save teams for a specific category
	 */
	saveTeams(category, teams) {
		storage.set(`teams_${category}`, teams);
	},

	/**
	 * Get draw results for a specific category
	 */
	getResults(category) {
		const saved = storage.get(`results_${category}`);
		if (saved) return saved;
		
		// Default empty results
		return Array(8).fill(null).map(() => ({ team1: '?', team2: '?' }));
	},

	/**
	 * Save draw results for a specific category
	 */
	saveResults(category, results) {
		storage.set(`results_${category}`, results);
	},

	/**
	 * Reset draw for a specific category
	 */
	resetDraw(category) {
		const emptyResults = Array(8).fill(null).map(() => ({ team1: '?', team2: '?' }));
		storage.set(`results_${category}`, emptyResults);
	}
};

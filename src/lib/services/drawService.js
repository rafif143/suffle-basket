/**
 * Draw Service
 * Handles all draw-related operations via API
 */

import { apiClient } from '$lib/api/client.js';

export const drawService = {
	/**
	 * Get teams for a specific category from draw results
	 */
	async getTeams(category) {
		try {
			// Get draw results which contain team names
			const response = await apiClient.get(`/draw/${category}/results`);
			const drawResults = response.data;
			
			// Extract unique team names from draw results
			const teams = new Set();
			drawResults.forEach(match => {
				if (match.team1 && match.team1 !== '?') teams.add(match.team1);
				if (match.team2 && match.team2 !== '?') teams.add(match.team2);
			});
			
			// Return as array
			return Array.from(teams).sort();
		} catch (error) {
			console.error(`Failed to get teams for ${category}:`, error);
			return [];
		}
	},

	/**
	 * Save teams for a specific category (not needed since we use registrations)
	 */
	async saveTeams(category, teams) {
		// Teams are managed through registrations, so this is a no-op
		console.log(`Teams for ${category} are managed through registrations`);
	},

	/**
	 * Get draw results for a specific category
	 */
	async getResults(category) {
		const response = await apiClient.get(`/draw/${category}/results`);
		return response.data;
	},

	/**
	 * Save draw results for a specific category
	 */
	async saveResults(category, results) {
		await apiClient.post(`/draw/${category}/results`, { results });
	},

	/**
	 * Reset draw for a specific category
	 */
	async resetDraw(category) {
		// Delete results by saving empty array
		await apiClient.post(`/draw/${category}/results`, { results: [] });
	}
};

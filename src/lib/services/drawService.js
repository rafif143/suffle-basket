/**
 * Draw Service
 * Handles all draw-related operations via API
 */

import { apiClient } from '$lib/api/client.js';

export const drawService = {
	/**
	 * Get teams for a specific category
	 */
	async getTeams(category) {
		const response = await apiClient.get(`/draw/${category}/teams`);
		return response.data;
	},

	/**
	 * Save teams for a specific category
	 */
	async saveTeams(category, teams) {
		await apiClient.post(`/draw/${category}/teams`, { teams });
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

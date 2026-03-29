/**
 * Draw Service
 * Handles all draw-related operations via API
 */

import { apiClient } from '$lib/api/client.js';

export const drawService = {
	/**
	 * Get teams for a specific category from verified registrations
	 */
	async getTeams(category) {
		try {
			// Parse category (e.g., "sma-putra" -> level: "SMA", gender: "Putra")
			const parts = category.split('-');
			const level = parts[0].toUpperCase(); // SMA or SMP
			const gender = parts[1].charAt(0).toUpperCase() + parts[1].slice(1); // Putra or Putri
			
			// Get verified registrations for this category
			const response = await apiClient.get('/registrations');
			const registrations = response.data;
			
			// Filter by category and status
			const verifiedTeams = registrations
				.filter(reg => 
					reg.level === level && 
					reg.gender === gender && 
					reg.status === 'Verified'
				)
				.map(reg => reg.school_name)
				.sort();
			
			return verifiedTeams;
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

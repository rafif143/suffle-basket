/**
 * Registration Service
 * Handles team registration data management via API
 */

import { apiClient } from '$lib/api/client.js';

export const registrationService = {
	/**
	 * Get all registrations
	 */
	async getAll() {
		const response = await apiClient.get('/registrations');
		return response.data;
	},

	/**
	 * Get registration by ID
	 */
	async getById(id) {
		const response = await apiClient.get(`/registrations/${id}`);
		return response.data;
	},

	/**
	 * Save new registration
	 */
	async save(registration) {
		const response = await apiClient.post('/registrations', {
			schoolName: registration.schoolName,
			schoolAddress: registration.schoolAddress,
			whatsapp: registration.whatsapp,
			level: registration.level,
			gender: registration.gender,
			players: registration.players,
			officials: registration.officials
		});
		return response.data;
	},

	/**
	 * Update registration status
	 */
	async updateStatus(id, status) {
		const response = await apiClient.patch(`/registrations/${id}`, { status });
		return response.data;
	},

	/**
	 * Delete registration
	 */
	async delete(id) {
		await apiClient.delete(`/registrations/${id}`);
	},

	/**
	 * Get statistics
	 */
	async getStats() {
		const response = await apiClient.get('/registrations/stats');
		return response.data;
	}
};

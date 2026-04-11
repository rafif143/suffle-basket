/**
 * Settings Service
 * Handles tournament settings via API
 */

import { apiClient } from '$lib/api/client.js';

export const settingsService = {
	/**
	 * Get tournament settings
	 */
	async getSettings() {
		const response = await apiClient.get('/settings');
		return response.data;
	},

	/**
	 * Save tournament settings
	 */
	async saveSettings(settings) {
		const response = await apiClient.post('/settings', {
			bankName: settings.bankName,
			accountNumber: settings.accountNumber,
			accountName: settings.accountName,
			registrationFees: settings.registrationFees,
			whatsappContact: settings.whatsappContact
		});
		return response.data;
	}
};

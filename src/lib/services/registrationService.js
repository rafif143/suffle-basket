/**
 * Registration Service
 * Handles team registration data management via API
 */

import { apiClient } from '$lib/api/client.js';
import { imageOptimizer } from '$lib/utils';

export const registrationService = {
	/**
	 * Get all registrations
	 */
	async getAll() {
		const response = await apiClient.get('/registrations');
		return response.data;
	},
	
	/**
	 * Get verified teams (PUBLIC)
	 */
	async getVerifiedTeams() {
		const response = await apiClient.get('/registrations?verified=true');
		return response.data;
	},

	/**
	 * Get registration by ID
	 */
	async getById(id) {
		const response = await apiClient.get(`/registrations?id=${id}`);
		return response.data;
	},

	/**
	 * Save new registration
	 */
	async save(registration) {
		// Compress and convert logo file if exists
		let logoFile = null;
		if (registration.logoFile) {
			try {
				imageOptimizer.validateImage(registration.logoFile);
				logoFile = await imageOptimizer.fileToBase64Compressed(registration.logoFile, 400, 0.8);
			} catch (error) {
				throw new Error(`Logo upload failed: ${error.message}`);
			}
		}

		// Process and compress payment proof
		let paymentProofFile = null;
		if (registration.paymentProofFile) {
			try {
				imageOptimizer.validateImage(registration.paymentProofFile);
				paymentProofFile = await imageOptimizer.fileToBase64Compressed(registration.paymentProofFile, 800, 0.8);
			} catch (error) {
				throw new Error(`Payment proof upload failed: ${error.message}`);
			}
		}

		// Process and compress player cards
		const processedPlayers = [];
		for (const player of registration.players) {
			let cardFile = null;
			if (player.card) {
				try {
					imageOptimizer.validateImage(player.card);
					cardFile = await imageOptimizer.fileToBase64Compressed(player.card, 600, 0.8);
				} catch (error) {
					throw new Error(`Player card upload failed for ${player.name}: ${error.message}`);
				}
			}
			processedPlayers.push({
				name: player.name,
				cardFile
			});
		}

		const response = await apiClient.post('/registrations', {
			schoolName: registration.schoolName,
			schoolAddress: registration.schoolAddress,
			whatsapp: registration.whatsapp,
			level: registration.level,
			gender: registration.gender,
			players: processedPlayers,
			officials: registration.officials,
			logoFile,
			paymentProofFile,
			status: registration.status
		});
		return response.data;
	},

	/**
	 * Update registration status
	 */
	async updateStatus(id, status) {
		const response = await apiClient.patch(`/registrations?id=${id}`, { status });
		return response.data;
	},

	/**
	 * Bulk update status (specifically for Pending -> Verified)
	 */
	async bulkUpdateStatus(status) {
		const response = await apiClient.patch('/registrations?bulk=true', { status });
		return response.data;
	},

	/**
	 * Delete registration
	 */
	async delete(id) {
		const url = id ? `/registrations?id=${id}` : '/registrations';
		await apiClient.delete(url);
	},

	/**
	 * Get statistics
	 */
	async getStats() {
		const response = await apiClient.get('/registrations?stats=true');
		return response.data;
	}
};

/**
 * Registration Service
 * Handles team registration data management
 * Ready to be replaced with API calls
 */

import { storage } from '$lib/utils/storage.js';

export const registrationService = {
	/**
	 * Get all registrations
	 */
	getAll() {
		return storage.get('registrations') || [];
	},

	/**
	 * Get registration by ID
	 */
	getById(id) {
		const registrations = this.getAll();
		return registrations.find(r => r.id === id);
	},

	/**
	 * Save new registration
	 */
	save(registration) {
		const registrations = this.getAll();
		const newRegistration = {
			...registration,
			id: `REG-${String(registrations.length + 1).padStart(3, '0')}`,
			timestamp: new Date().toISOString(),
			status: 'Pending'
		};
		registrations.push(newRegistration);
		storage.set('registrations', registrations);
		return newRegistration;
	},

	/**
	 * Update registration status
	 */
	updateStatus(id, status) {
		const registrations = this.getAll();
		const updated = registrations.map(r => 
			r.id === id ? { ...r, status } : r
		);
		storage.set('registrations', updated);
		return updated.find(r => r.id === id);
	},

	/**
	 * Delete registration
	 */
	delete(id) {
		const registrations = this.getAll();
		const filtered = registrations.filter(r => r.id !== id);
		storage.set('registrations', filtered);
	},

	/**
	 * Get statistics
	 */
	getStats() {
		const registrations = this.getAll();
		return {
			total: registrations.length,
			pending: registrations.filter(r => r.status === 'Pending').length,
			verified: registrations.filter(r => r.status === 'Verified').length,
			rejected: registrations.filter(r => r.status === 'Rejected').length
		};
	}
};

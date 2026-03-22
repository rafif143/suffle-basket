/**
 * LocalStorage utility functions
 * Ready to be replaced with API calls when backend is integrated
 */

export const storage = {
	get(key) {
		if (typeof window === 'undefined') return null;
		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : null;
		} catch (error) {
			console.error(`Error reading from localStorage: ${key}`, error);
			return null;
		}
	},

	set(key, value) {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error(`Error writing to localStorage: ${key}`, error);
		}
	},

	remove(key) {
		if (typeof window === 'undefined') return;
		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.error(`Error removing from localStorage: ${key}`, error);
		}
	},

	clear() {
		if (typeof window === 'undefined') return;
		try {
			localStorage.clear();
		} catch (error) {
			console.error('Error clearing localStorage', error);
		}
	}
};

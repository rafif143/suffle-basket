import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Auth store
function createAuthStore() {
	const { subscribe, set, update } = writable({
		isAuthenticated: false,
		user: null,
		loading: true
	});

	return {
		subscribe,
		login: async (username, password) => {
			try {
				const response = await fetch('/api/auth?action=login', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username, password })
				});

				if (!response.ok) {
					if (response.status === 0 || response.status >= 500) {
						throw new Error('Server tidak dapat diakses');
					}
				}

				const data = await response.json();

				if (data.success) {
					// Store token in localStorage
					if (browser) {
						localStorage.setItem('auth_token', data.token);
					}
					
					set({
						isAuthenticated: true,
						user: data.user,
						loading: false
					});
					
					return { success: true };
				} else {
					return { success: false, message: data.message };
				}
			} catch (error) {
				console.error('Login error:', error);
				if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Server tidak dapat diakses')) {
					return { success: false, message: 'Server tidak dapat diakses. Pastikan backend berjalan dan koneksi internet stabil.' };
				}
				return { success: false, message: 'Login gagal. Silakan coba lagi.' };
			}
		},
		logout: () => {
			if (browser) {
				localStorage.removeItem('auth_token');
			}
			set({
				isAuthenticated: false,
				user: null,
				loading: false
			});
		},
		register: async (userData) => {
			try {
				const response = await fetch('/api/auth?action=register', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(userData)
				});

				if (!response.ok) {
					if (response.status === 0 || response.status >= 500) {
						throw new Error('Server tidak dapat diakses');
					}
				}

				const data = await response.json();
				return data;
			} catch (error) {
				console.error('Registration error:', error);
				if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Server tidak dapat diakses')) {
					return { success: false, message: 'Server tidak dapat diakses. Pastikan backend berjalan dan koneksi internet stabil.' };
				}
				return { success: false, message: 'Registrasi gagal. Silakan coba lagi.' };
			}
		},
		checkAuth: async () => {
			if (!browser) {
				set({ isAuthenticated: false, user: null, loading: false });
				return;
			}

			const token = localStorage.getItem('auth_token');
			if (!token) {
				set({ isAuthenticated: false, user: null, loading: false });
				return;
			}

			try {
				const response = await fetch('/api/auth', {
					headers: { 'Authorization': `Bearer ${token}` }
				});

				const data = await response.json();

				if (data.success) {
					set({
						isAuthenticated: true,
						user: data.user,
						loading: false
					});
				} else {
					localStorage.removeItem('auth_token');
					set({ isAuthenticated: false, user: null, loading: false });
				}
			} catch (error) {
				localStorage.removeItem('auth_token');
				set({ isAuthenticated: false, user: null, loading: false });
			}
		}
	};
}

export const auth = createAuthStore();
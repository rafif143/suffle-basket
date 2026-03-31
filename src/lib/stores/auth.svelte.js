import { supabase } from '$lib/supabase';
import { browser } from '$app/environment';

// Auth state using Svelte 5 runes
const authState = $state({
	isAuthenticated: false,
	user: null,
	loading: true
});

// Save session token to localStorage for backend API
function saveSessionToken(session) {
	if (!browser) return;
	if (session?.access_token) {
		localStorage.setItem('auth_token', session.access_token);
	} else {
		localStorage.removeItem('auth_token');
	}
}

// Initialize auth state on mount
if (browser) {
	// Get initial session
	supabase.auth.getSession().then(({ data: { session } }) => {
		authState.isAuthenticated = !!session;
		authState.user = session?.user ?? null;
		authState.loading = false;
		saveSessionToken(session);
	});

	// Listen for auth changes
	supabase.auth.onAuthStateChange((_event, session) => {
		authState.isAuthenticated = !!session;
		authState.user = session?.user ?? null;
		authState.loading = false;
		saveSessionToken(session);
	});
}

export const auth = {
	get isAuthenticated() {
		return authState.isAuthenticated;
	},
	get user() {
		return authState.user;
	},
	get loading() {
		return authState.loading;
	},
	subscribe(run) {
		run(authState);
		return () => {}; // Simple unsubscribe - in real app could use proper reactivity
	},
	login: async (email, password) => {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error) throw error;

			return { success: true, user: data.user };
		} catch (error) {
			console.error('Login error:', error);
			return {
				success: false,
				message: error.message || 'Login failed. Please check your credentials.'
			};
		}
	},
	logout: async () => {
		try {
			await supabase.auth.signOut();
			authState.isAuthenticated = false;
			authState.user = null;
			authState.loading = false;
			return { success: true };
		} catch (error) {
			console.error('Logout error:', error);
			return { success: false, message: error.message };
		}
	},
	checkAuth: async () => {
		if (!browser) {
			authState.isAuthenticated = false;
			authState.user = null;
			authState.loading = false;
			return;
		}

		try {
			const { data: { session } } = await supabase.auth.getSession();
			authState.isAuthenticated = !!session;
			authState.user = session?.user ?? null;
			authState.loading = false;
		} catch (error) {
			console.error('Auth check error:', error);
			authState.isAuthenticated = false;
			authState.user = null;
			authState.loading = false;
		}
	},
	getSession: async () => {
		const { data: { session } } = await supabase.auth.getSession();
		return session;
	}
};

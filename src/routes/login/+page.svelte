<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.js';
	
	let username = '';
	let password = '';
	let loading = false;
	let error = '';
	let showPassword = false;

	// Redirect if already authenticated
	onMount(() => {
		const unsubscribe = auth.subscribe(($auth) => {
			// Only redirect if fully loaded and authenticated
			if (!$auth.loading && $auth.isAuthenticated) {
				goto('/draw');
			}
		});
		
		// Check auth but don't force redirect
		auth.checkAuth();
		return unsubscribe;
	});

	async function handleLogin(e) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			const result = await auth.login(username, password);
			
			if (result.success) {
				goto('/draw');
			} else {
				// More specific error messages
				if (result.message.includes('Invalid credentials') || result.message.includes('User not found')) {
					error = 'Username atau password salah. Silakan cek kembali.';
				} else if (result.message.includes('network') || result.message.includes('fetch')) {
					error = 'Server tidak dapat diakses. Pastikan koneksi internet stabil.';
				} else {
					error = result.message || 'Login gagal. Silakan coba lagi.';
				}
			}
		} catch (err) {
			console.error('Login error:', err);
			error = 'Server tidak dapat diakses. Pastikan backend berjalan dan koneksi internet stabil.';
		}
		
		loading = false;
	}
</script>

<svelte:head>
	<title>Login | Yadika Cup</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
	<div class="w-full max-w-md">
		<!-- Logo & Title -->
		<div class="text-center mb-8">
			<div class="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<rect width="12" height="12" x="2" y="10" rx="2" ry="2"/>
					<path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/>
					<path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/>
				</svg>
			</div>
			<h1 class="font-montserrat text-3xl font-black text-neutral-900 mb-2">Yadika Cup</h1>
			<p class="text-neutral-500 font-poppins">Tournament Management System</p>
		</div>

		<!-- Login Form -->
		<div class="bg-white rounded-3xl border border-neutral-200 p-8 shadow-xl shadow-neutral-100">
			<div class="mb-6">
				<h2 class="font-montserrat text-xl font-extrabold text-neutral-900 mb-1">Welcome Back</h2>
				<p class="text-sm text-neutral-500">Sign in to access tournament management</p>
			</div>

			{#if error}
				<div class="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
					<p class="text-sm font-poppins font-semibold text-red-700">{error}</p>
				</div>
			{/if}

			<form onsubmit={handleLogin} class="space-y-4">
				<div>
					<label for="username" class="block text-sm font-poppins font-semibold text-neutral-700 mb-2">Username</label>
					<input 
						id="username"
						type="text" 
						bind:value={username}
						required
						disabled={loading}
						placeholder="Enter your username"
						class="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white disabled:opacity-50"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-poppins font-semibold text-neutral-700 mb-2">Password</label>
					<div class="relative">
						<input 
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							required
							disabled={loading}
							placeholder="Enter your password"
							class="w-full px-4 py-3 pr-12 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white disabled:opacity-50"
						/>
						<button
							type="button"
							onclick={() => showPassword = !showPassword}
							class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
							disabled={loading}
						>
							{#if showPassword}
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
									<line x1="1" y1="1" x2="23" y2="23"/>
								</svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
									<circle cx="12" cy="12" r="3"/>
								</svg>
							{/if}
						</button>
					</div>
				</div>

				<button 
					type="submit" 
					disabled={loading || !username || !password}
					class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-poppins font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
				>
					{#if loading}
						<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
						</svg>
						Signing in...
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
							<polyline points="10 17 15 12 10 7"/>
							<line x1="15" x2="3" y1="12" y2="12"/>
						</svg>
						Sign In
					{/if}
				</button>
			</form>

		</div>

		<!-- Registration Link -->
		<div class="text-center mt-6">
			<p class="text-sm text-neutral-500 mb-2">Don't have an account?</p>
			<a href="/register" class="text-indigo-600 hover:text-indigo-700 font-poppins font-semibold text-sm transition-colors">
				Create Account →
			</a>
		</div>

		<!-- Public Access -->
		<div class="text-center mt-4">
			<p class="text-sm text-neutral-500 mb-2">Looking for live scores?</p>
			<a href="/live-scores" class="text-indigo-600 hover:text-indigo-700 font-poppins font-semibold text-sm transition-colors">
				View Live Scores →
			</a>
		</div>
	</div>
</div>
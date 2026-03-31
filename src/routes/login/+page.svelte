<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth.svelte.js';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let showPassword = $state(false);

	// Redirect if already authenticated
	$effect(() => {
		if (!auth.loading && auth.isAuthenticated) {
			const redirect = $page.url.searchParams.get('redirect') || '/schedule';
			goto(redirect);
		}
	});

	async function handleSubmit(e) {
		e.preventDefault();
		error = '';
		loading = true;

		const result = await auth.login(email, password);

		if (result.success) {
			// Redirect handled by auth state effect
		} else {
			error = result.message;
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login | Yadika Cup</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-[#0f1123] via-[#1a1d35] to-[#0f1123] flex items-center justify-center p-6">
	<div class="w-full max-w-md">
		<!-- Logo/Brand -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center gap-2 mb-4">
				<div class="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<rect width="12" height="12" x="2" y="10" rx="2" ry="2"/>
						<path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/>
						<path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/>
					</svg>
				</div>
			</div>
			<h1 class="font-montserrat text-3xl font-black text-white mb-2">Welcome Back</h1>
			<p class="text-white/60 font-poppins text-sm">Sign in to your Yadika Cup account</p>
		</div>

		<!-- Login Form -->
		<div class="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/15 p-8 shadow-2xl">
			<form onsubmit={handleSubmit} class="space-y-5">
				{#if error}
					<div class="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 flex items-start gap-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
						<p class="text-red-200 text-sm font-poppins">{error}</p>
					</div>
				{/if}

				<div>
					<label for="email" class="block text-sm font-poppins font-semibold text-white/80 mb-2">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						placeholder="your@email.com"
						class="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl font-poppins text-sm font-medium text-white placeholder:text-white/30 outline-none transition-all focus:border-indigo-500 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-poppins font-semibold text-white/80 mb-2">Password</label>
					<div class="relative">
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							required
							placeholder="Enter your password"
							class="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl font-poppins text-sm font-medium text-white placeholder:text-white/30 outline-none transition-all focus:border-indigo-500 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20"
						/>
						<button
							type="button"
							onclick={() => showPassword = !showPassword}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
						>
							{#if showPassword}
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
							{/if}
						</button>
					</div>
				</div>

				<button
					type="submit"
					disabled={loading || !email || !password}
					class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-poppins font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
				>
					{#if loading}
						<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
						Signing in...
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
						Sign In
					{/if}
				</button>
			</form>
		</div>

		<!-- Footer -->
		<p class="text-center text-white/40 text-xs mt-8 font-poppins">
			© 2026 Yadika Cup Basketball Championship
		</p>
	</div>
</div>

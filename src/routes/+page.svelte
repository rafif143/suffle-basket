<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth.svelte.js';

	onMount(() => {
		if (!auth.loading) {
			if (auth.isAuthenticated) {
				goto('/draw', { replaceState: true });
			} else {
				goto('/live-scores', { replaceState: true });
			}
		} else {
			// Wait for auth to finish loading
			const checkAuth = setInterval(() => {
				if (!auth.loading) {
					clearInterval(checkAuth);
					if (auth.isAuthenticated) {
						goto('/draw', { replaceState: true });
					} else {
						goto('/live-scores', { replaceState: true });
					}
				}
			}, 100);
			return () => clearInterval(checkAuth);
		}
	});
</script>

<div class="min-h-screen bg-[#0f1123] flex items-center justify-center">
	<div class="text-center">
		<div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
		<p class="mt-4 text-indigo-400 font-poppins font-bold animate-pulse">Initializing Yadika Cup...</p>
	</div>
</div>

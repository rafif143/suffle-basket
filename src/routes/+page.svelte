<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/draw', { replaceState: true });
	});
</script>

<div class="min-h-screen bg-neutral-50 flex items-center justify-center">
	<div class="text-center">
		<div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
		<p class="mt-4 text-neutral-600 font-poppins">Redirecting...</p>
	</div>
</div>

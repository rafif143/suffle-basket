<script>
	import { onMount } from 'svelte';
	import { matchService } from '$lib/services';

	let matches = $state([]);
	let loading = $state(true);
	let error = $state(null);

	onMount(async () => {
		try {
			console.log('Loading matches...');
			matches = await matchService.getMatches();
			console.log('Loaded matches:', matches);
		} catch (err) {
			console.error('Error loading matches:', err);
			error = err.message;
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Test Matches</title>
</svelte:head>

<div class="p-8">
	<h1 class="text-2xl font-bold mb-4">Test Matches Data</h1>
	
	{#if loading}
		<p>Loading...</p>
	{:else if error}
		<p class="text-red-600">Error: {error}</p>
	{:else}
		<p class="mb-4">Found {matches.length} matches</p>
		
		<div class="space-y-2">
			{#each matches.slice(0, 10) as match}
				<div class="border p-3 rounded">
					<div class="font-bold">{match.category} {match.round} M{match.match_number}</div>
					<div>{match.team1} vs {match.team2}</div>
					<div class="text-sm text-gray-600">Day {match.day}, {match.match_time} - {match.status}</div>
				</div>
			{/each}
		</div>
		
		{#if matches.length > 10}
			<p class="mt-4 text-gray-600">... and {matches.length - 10} more matches</p>
		{/if}
	{/if}
</div>
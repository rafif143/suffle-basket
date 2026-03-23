<script>
	import { onMount } from 'svelte';

	let liveScores = $state([]);
	let loading = $state(true);
	let lastUpdated = $state('');
	let selectedDay = $state('All');

	onMount(() => {
		loadLiveScores();
		// Auto-refresh every 30 seconds
		const interval = setInterval(loadLiveScores, 30000);
		return () => clearInterval(interval);
	});

	async function loadLiveScores() {
		try {
			const response = await fetch('/api/live-scores');
			const data = await response.json();
			
			if (data.success) {
				liveScores = data.data.matches;
				lastUpdated = new Date(data.data.lastUpdated).toLocaleTimeString('id-ID');
			}
		} catch (error) {
			console.error('Failed to load live scores:', error);
		} finally {
			loading = false;
		}
	}

	let filteredScores = $derived(
		selectedDay === 'All' 
			? liveScores 
			: liveScores.filter(match => match.day === parseInt(selectedDay))
	);

	let availableDays = $derived(
		[...new Set(liveScores.map(match => match.day))].sort((a, b) => a - b)
	);

	function getRoundName(day) {
		if (day === 13) return 'Grand Final';
		if (day >= 11) return 'Semi Final';
		if (day >= 7) return 'Quarter Final';
		return 'Round of 16';
	}

	function getMatchStatus(match) {
		if (match.isComplete) {
			return match.team1Score > match.team2Score ? 'Team 1 Wins' : 'Team 2 Wins';
		}
		return 'In Progress';
	}
</script>

<svelte:head>
	<title>Live Scores | Yadika Cup</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50">
	<!-- Header -->
	<header class="bg-white/90 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
		<div class="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"/>
						<polyline points="12 6 12 12 16 14"/>
					</svg>
				</div>
				<div>
					<h1 class="font-montserrat text-xl font-extrabold text-neutral-900">Live Scores</h1>
					<p class="text-xs text-neutral-400">Yadika Cup Basketball Championship</p>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<!-- Day Filter -->
				<select bind:value={selectedDay} class="px-3 py-2 bg-white border-2 border-neutral-200 rounded-lg font-poppins text-sm font-semibold text-neutral-700 outline-none cursor-pointer">
					<option value="All">All Days</option>
					{#each availableDays as day}
						<option value={day}>Day {day}</option>
					{/each}
				</select>

				<!-- Refresh Button -->
				<button 
					onclick={loadLiveScores}
					disabled={loading}
					class="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-poppins font-semibold text-sm rounded-lg transition-colors"
				>
					<svg class="{loading ? 'animate-spin' : ''}" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
						<path d="M21 3v5h-5"/>
						<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
						<path d="M3 21v-5h5"/>
					</svg>
					Refresh
				</button>
			</div>
		</div>

		{#if lastUpdated}
			<div class="px-6 pb-3">
				<p class="text-xs text-neutral-500">Last updated: {lastUpdated}</p>
			</div>
		{/if}
	</header>

	<!-- Content -->
	<main class="p-6">
		{#if loading && liveScores.length === 0}
			<div class="flex items-center justify-center py-20">
				<div class="text-center">
					<div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p class="text-neutral-600 font-poppins">Loading live scores...</p>
				</div>
			</div>
		{:else if filteredScores.length === 0}
			<div class="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
				<div class="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400">
						<circle cx="12" cy="12" r="10"/>
						<line x1="12" y1="8" x2="12" y2="12"/>
						<line x1="12" y1="16" x2="12.01" y2="16"/>
					</svg>
				</div>
				<h3 class="font-montserrat text-lg font-bold text-neutral-500 mb-2">No Matches Found</h3>
				<p class="text-neutral-400 text-sm">No live scores available for the selected day.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each filteredScores as match}
					<div class="bg-white rounded-xl border-2 {match.isComplete ? 'border-green-200' : 'border-neutral-200'} p-4 hover:shadow-lg transition-all">
						<!-- Match Header -->
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-2">
								<span class="text-xs font-montserrat font-extrabold text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
									Day {match.day}
								</span>
								<span class="text-xs font-poppins font-semibold text-indigo-600">
									{getRoundName(match.day)}
								</span>
							</div>
							<span class="text-xs font-poppins font-bold text-neutral-500">{match.matchId}</span>
						</div>

						<!-- Category -->
						<div class="mb-3">
							<span class="text-sm font-poppins font-bold text-neutral-900">{match.category}</span>
						</div>

						<!-- Score Display -->
						<div class="bg-neutral-50 rounded-lg p-3 mb-3">
							{#if match.isComplete}
								<div class="flex items-center justify-between">
									<span class="text-lg font-montserrat font-black text-neutral-900">Team 1</span>
									<span class="text-2xl font-montserrat font-black text-indigo-600">{match.team1Score}</span>
								</div>
								<div class="flex items-center justify-center my-2">
									<span class="text-xs font-poppins font-semibold text-neutral-400">VS</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-lg font-montserrat font-black text-neutral-900">Team 2</span>
									<span class="text-2xl font-montserrat font-black text-indigo-600">{match.team2Score}</span>
								</div>
							{:else}
								<div class="text-center py-4">
									<p class="text-sm font-poppins font-semibold text-neutral-500">Match not started</p>
									<p class="text-xs text-neutral-400 mt-1">Scores will appear here</p>
								</div>
							{/if}
						</div>

						<!-- Status -->
						<div class="flex items-center justify-between">
							<span class="text-xs font-poppins font-semibold {match.isComplete ? 'text-green-600' : 'text-amber-600'}">
								{match.isComplete ? 'Completed' : 'Scheduled'}
							</span>
							{#if match.isComplete && match.team1Score !== match.team2Score}
								<span class="text-xs font-poppins font-bold text-indigo-600">
									{match.team1Score > match.team2Score ? 'Team 1 Wins' : 'Team 2 Wins'}
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Footer -->
		<div class="text-center mt-12 pt-8 border-t border-neutral-200">
			<p class="text-sm text-neutral-500 mb-2">Tournament Management System</p>
			<a href="/login" class="text-indigo-600 hover:text-indigo-700 font-poppins font-semibold text-sm transition-colors">
				Admin Login →
			</a>
		</div>
	</main>
</div>
<script>
	import { onMount } from 'svelte';
	import { drawService, scheduleService } from '$lib/services';
	import { CategoryFilter, BracketVisualization, MatchCard } from '$lib/components/features';
	import { MatchTable } from '$lib/components/features/SchedulePage';
	import { apiCache } from '$lib/utils/cache.js';

	let activeLevel = $state('ALL'); // 'SMA', 'SMP', or 'ALL'
	let activeGender = $state('ALL'); // 'Putra', 'Putri', or 'ALL'
	let activeView = $state('bracket'); // 'bracket' or 'schedule'
	
	let teamsInput = $state([]);
	let drawResults = $state(Array(8).fill({ team1: '?', team2: '?' }));
	let matchScores = $state({});
	let scheduleData = $state([]);
	let loading = $state(true);

	// Fetch all data
	async function loadAllData() {
		try {
			loading = true;
			const category = activeLevel === 'ALL' || activeGender === 'ALL' 
				? 'sma-putra' // fallback for getting teams/results if ALL
				: `${activeLevel.toLowerCase()}-${activeGender.toLowerCase()}`;
			
			// Load Draw Results (Always load SMA Putra as base if on ALL view for bracket)
			teamsInput = await drawService.getTeams(category);
			drawResults = await drawService.getResults(category);
			
			// Load Schedule
			const scheduleResponse = await fetch('/api/schedule');
			const scheduleJson = await scheduleResponse.json();
			if (scheduleJson.success) {
				scheduleData = scheduleJson.data.map(match => {
					// Extract match_number from matchStrId (handles M01, QF1, SF1, F1)
					let match_number;
					if (match.matchStrId.startsWith('M')) {
						match_number = parseInt(match.matchStrId.replace('M', ''));
					} else if (match.matchStrId.startsWith('QF')) {
						match_number = parseInt(match.matchStrId.replace('QF', ''));
					} else if (match.matchStrId.startsWith('SF')) {
						match_number = parseInt(match.matchStrId.replace('SF', ''));
					} else if (match.matchStrId.startsWith('F')) {
						match_number = 1;
					} else {
						match_number = 1;
					}
					
					return {
						...match,
						match_number,
						match_time: match.time,
						category: match.category
					};
				});
			}

			// Load Scores
			matchScores = await scheduleService.getScores();
		} catch (error) {
			console.error('Failed to load live data:', error);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadAllData();
		// Auto refresh every 30 seconds for live feel
		const interval = setInterval(() => {
			apiCache.clear();
			loadAllData();
		}, 30000);
		return () => clearInterval(interval);
	});

	// Derived values for schedule view
	let filteredSchedule = $derived(
		scheduleData.filter(m => {
			const matchLevel = activeLevel === 'ALL' || m.level === activeLevel;
			const matchGender = activeGender === 'ALL' || m.gender === activeGender;
			return matchLevel && matchGender;
		})
	);

	let groupedSchedule = $derived.by(() => {
		const groups = {};
		filteredSchedule.forEach(match => {
			if (!groups[match.day]) groups[match.day] = [];
			groups[match.day].push(match);
		});
		return Object.keys(groups)
			.map(day => ({ day: parseInt(day), matches: groups[day] }))
			.sort((a, b) => a.day - b.day);
	});

	// Helper function: Generate consistent match_key for all rounds
	function generateMatchKey(match) {
		const day = match.day;
		const round = match.round;
		const match_number = match.match_number || match.matchStrId?.replace(/[A-Z]/g, '');
		
		let prefix;
		if (round === '16 Besar') {
			prefix = `M${String(match_number).padStart(2, '0')}`;
		} else if (round === '8 Besar') {
			prefix = `QF${match_number}`;
		} else if (round === 'Semi Final') {
			prefix = `SF${match_number}`;
		} else if (round === 'Final') {
			prefix = 'F1';
		} else {
			prefix = `M${String(match_number).padStart(2, '0')}`;
		}
		
		return `${day}-${prefix}-${match.category.toLowerCase().replace(' ', '-')}`;
	}

	function isMatchComplete(match) {
		const scoreKey = generateMatchKey(match);
		const score = matchScores[scoreKey];
		return score && score.score1 !== undefined && score.score2 !== undefined;
	}

	function getMatchScore(match) {
		const scoreKey = generateMatchKey(match);
		return matchScores[scoreKey] || null;
	}
</script>

<svelte:head>
	<title>Live Scores | Yadika Cup 2026</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-[#0f1123] via-[#1a1d35] to-[#0f1123] text-white">
	<!-- Navbar Public -->
	<nav class="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
					<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<rect width="12" height="12" x="2" y="10" rx="2" ry="2"/>
						<path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/>
						<path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/>
					</svg>
				</div>
				<div>
					<h1 class="font-montserrat font-black text-xl tracking-tighter">YADIKA <span class="text-indigo-400">CUP</span></h1>
					<p class="text-[10px] text-white/40 font-poppins uppercase tracking-[0.2em] -mt-1 font-bold">Live Championship 2026</p>
				</div>
			</div>
			
			<div class="hidden md:flex items-center gap-8 font-poppins text-xs font-bold uppercase tracking-wider">
				<a href="/registration" class="text-white/60 hover:text-white transition-colors">Registration</a>
				<div class="h-4 w-px bg-white/10"></div>
				<a href="/login" class="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">Admin Logic</a>
			</div>
		</div>
	</nav>

	<main class="max-w-7xl mx-auto px-6 py-10">
		<!-- Header Section -->
		<div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
			<div class="space-y-2">
				<div class="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
					<span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
					<span class="text-[10px] font-montserrat font-black text-red-500 uppercase tracking-widest">Live Updates</span>
				</div>
				<h2 class="font-montserrat text-4xl font-black text-white">Tournament Center</h2>
				<p class="font-poppins text-white/50 max-w-xl">Follow the latest results and upcoming matches from Yadika Cup Basketball Championship 2026.</p>
			</div>

			<!-- View Switcher -->
			<div class="flex bg-white/5 border border-white/10 p-1 rounded-2xl">
				<button 
					onclick={() => activeView = 'bracket'}
					class="px-6 py-2.5 rounded-xl font-poppins text-xs font-bold transition-all uppercase tracking-wider {activeView === 'bracket' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}"
				>
					Bracket
				</button>
				<button 
					onclick={() => activeView = 'schedule'}
					class="px-6 py-2.5 rounded-xl font-poppins text-xs font-bold transition-all uppercase tracking-wider {activeView === 'schedule' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}"
				>
					Schedule
				</button>
			</div>
		</div>

		<!-- Filters -->
		<div class="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
			<div class="flex flex-col gap-3">
				<div class="flex gap-2 text-[10px] font-montserrat font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Level</div>
				<div class="flex gap-2">
					{#each ['ALL', 'SMA', 'SMP'] as lvl}
						<button 
							onclick={() => { activeLevel = lvl; loadAllData(); }}
							class="px-8 py-3 rounded-xl font-poppins font-bold text-sm transition-all border-2 {activeLevel === lvl ? 'bg-white text-indigo-900 border-white shadow-xl shadow-white/5' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}"
						>
							{lvl === 'ALL' ? 'SEMUA' : lvl}
						</button>
					{/each}
				</div>
			</div>

			<div class="flex flex-col gap-3 items-end">
				<div class="flex gap-2 text-[10px] font-montserrat font-black text-indigo-400 uppercase tracking-[0.2em] mr-2">Gender</div>
				<div class="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
					{#each ['ALL', 'Putra', 'Putri'] as gen}
						<button 
							onclick={() => { activeGender = gen; loadAllData(); }}
							class="px-6 py-2 rounded-lg font-poppins font-bold text-xs transition-all {activeGender === gen ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white/60'}"
						>
							{gen === 'ALL' ? 'SEMUA' : gen}
						</button>
					{/each}
				</div>
			</div>
		</div>

		{#if (activeLevel === 'ALL' || activeGender === 'ALL') && activeView === 'bracket'}
			<div class="mb-6 p-4 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center gap-3">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
				<p class="text-xs font-poppins font-semibold text-indigo-400">Pilih Level & Gender spesifik untuk melihat bagan turnamen secara detail.</p>
			</div>
		{/if}

		{#if loading}
			<div class="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
				<div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
				<p class="font-montserrat font-bold text-sm text-indigo-400 animate-pulse">Synchronizing Data...</p>
			</div>
		{:else}
			<div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
				{#if activeView === 'bracket'}
					<div class="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm overflow-hidden">
						<!-- Reusing BracketVisualization but with customized styles if needed -->
						<!-- Note: BracketVisualization has internal white bg, we might want to fix that or just let it be -->
						<div class="inverted-component">
							<BracketVisualization 
								matches={drawResults} 
								level={activeLevel} 
								gender={activeGender}
								scores={matchScores}
							/>
						</div>
					</div>
				{:else}
					<div class="space-y-12">
						{#if groupedSchedule.length === 0}
							<div class="bg-white/5 border border-white/10 rounded-3xl p-20 text-center">
								<h3 class="font-montserrat text-xl font-bold text-white/30 tracking-wider">NO MATCHES SCHEDULED YET</h3>
							</div>
						{:else}
							{#each groupedSchedule as dayGroup}
								<div class="space-y-6">
									<div class="flex items-center gap-4">
										<div class="h-px flex-1 bg-white/10"></div>
										<h3 class="font-montserrat font-black text-xl text-indigo-400">DAY {dayGroup.day}</h3>
										<div class="h-px flex-1 bg-white/10"></div>
									</div>
									<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{#each dayGroup.matches as match, i}
											<MatchCard 
												{match} 
												index={match.match_number - 1} 
												level={activeLevel} 
												gender={activeGender} 
												isComplete={isMatchComplete(match)}
												score={getMatchScore(match)}
												onInputScore={null} 
											/>
										{/each}
									</div>
								</div>
							{/each}
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="mt-20 border-t border-white/5 py-12 px-6">
		<div class="max-w-7xl mx-auto text-center space-y-4">
			<p class="text-white/20 font-poppins text-xs font-semibold tracking-widest uppercase">© 2026 Yadika Cup Basketball Championship · Organized by Yadika Foundation</p>
		</div>
	</footer>
</div>

<style>
	/* Make the inner light components fit into the dark theme if they have hardcoded white bg */
	:global(.inverted-component > div) {
		background: rgba(255, 255, 255, 0.03) !important;
		border-color: rgba(255, 255, 255, 0.1) !important;
	}
	:global(.inverted-component h3, .inverted-component h4) {
		color: rgba(255, 255, 255, 0.9) !important;
	}
	:global(.inverted-component p, .inverted-component span.text-neutral-500) {
		color: rgba(255, 255, 255, 0.4) !important;
	}
	:global(.inverted-component .bg-neutral-50) {
		background: rgba(255, 255, 255, 0.05) !important;
		border-color: rgba(255, 255, 255, 0.1) !important;
	}
	:global(.inverted-component .text-neutral-900, .inverted-component .text-neutral-700) {
		color: #fff !important;
	}
</style>

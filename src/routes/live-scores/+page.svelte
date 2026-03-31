<script>
	import { onMount } from 'svelte';
	import { scheduleService } from '$lib/services';
	import { MatchCard } from '$lib/components/features';
	import { PublicNavbar } from '$lib/components/ui';
	import { apiCache } from '$lib/utils/cache.js';

	let activeCategory = $state('ALL'); // 'ALL', 'SMA_PUTRA', 'SMA_PUTRI', 'SMP_PUTRA', 'SMP_PUTRI'

	let matchScores = $state({});
	let scheduleData = $state([]);
	let loading = $state(true);

	// Derived values for active filters
	let activeLevel = $derived(activeCategory === 'ALL' ? 'ALL' : activeCategory.split('_')[0]); // "SMA" or "SMP"
	let activeGender = $derived(
		activeCategory === 'ALL' 
			? 'ALL' 
			: activeCategory.split('_')[1].charAt(0).toUpperCase() + activeCategory.split('_')[1].slice(1).toLowerCase()
	); // "Putra" or "Putri"

	// Derived values for schedule view - with proper filtering
	let filteredSchedule = $derived(
		scheduleData.filter(m => {
			if (activeCategory === 'ALL') return true;
			// Match category format: "SMA Putra", "SMA Putri", etc.
			const expectedCategory = `${activeLevel} ${activeGender}`;
			return m.category.trim() === expectedCategory;
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

	// Get round name for a day group based on matches
	function getRoundName(matches) {
		if (matches.length === 0) return '';
		const firstMatch = matches[0];
		return firstMatch.round || '16 Besar';
	}

	// Fetch all data
	async function loadAllData() {
		try {
			loading = true;

			// Load Schedule
			const data = await scheduleService.getSchedule();
			scheduleData = data.map(match => {
				// Extract match_number from matchStrId (handles M01, QF1, SF1, F1)
				let match_number;
				if (match.matchStrId.startsWith('M')) {
					match_number = parseInt(match.matchStrId.replace('M', ''));
				} else if (match.matchStrId.startsWith('QF')) {
					match_number = parseInt(match.matchStrId.replace('QF', '')) + 8;
				} else if (match.matchStrId.startsWith('SF')) {
					match_number = parseInt(match.matchStrId.replace('SF', '')) + 12;
				} else if (match.matchStrId.startsWith('F')) {
					match_number = 15;
				} else {
					match_number = 1;
				}

				// Extract level and gender from category string (e.g., "SMA Putra")
				const parts = match.category.split(' ');
				const level = parts[0];
				const gender = parts[1];
				
				return {
					...match,
					match_number,
					match_time: match.time,
					category: match.category,
					level,
					gender
				};
			});

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

	<main class="max-w-7xl mx-auto px-6 py-10">
		<!-- Header Section -->
		<div class="mb-12">
			<div class="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
				<span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
				<span class="text-[10px] font-montserrat font-black text-red-500 uppercase tracking-widest">Live Updates</span>
			</div>
			<h2 class="font-montserrat text-4xl font-black text-white">Tournament Center</h2>
			<p class="font-poppins text-white/50 max-w-xl">Follow the latest results and upcoming matches from Yadika Cup Basketball Championship 2026.</p>
		</div>

		<!-- Filters -->
		<div class="flex gap-3 mb-10 overflow-x-auto pb-2">
			{#each [
				{ value: 'ALL', label: 'SEMUA' },
				{ value: 'SMA_PUTRA', label: 'SMA PUTRA' },
				{ value: 'SMA_PUTRI', label: 'SMA PUTRI' },
				{ value: 'SMP_PUTRA', label: 'SMP PUTRA' },
				{ value: 'SMP_PUTRI', label: 'SMP PUTRI' }
			] as category}
				<button
					onclick={() => activeCategory = category.value}
					class="px-6 py-3 rounded-xl font-poppins font-bold text-sm whitespace-nowrap transition-all border-2 {activeCategory === category.value ? 'bg-white text-indigo-900 border-white shadow-xl shadow-white/5' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}"
				>
					{category.label}
				</button>
			{/each}
		</div>

		{#if loading}
			<div class="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
				<div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
				<p class="font-montserrat font-bold text-sm text-indigo-400 animate-pulse">Synchronizing Data...</p>
			</div>
		{:else}
			<div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
				<div class="space-y-12">
					{#if groupedSchedule.length === 0}
						<div class="bg-white/5 border border-white/10 rounded-3xl p-20 text-center">
							<h3 class="font-montserrat text-xl font-bold text-white/30 tracking-wider">NO MATCHES SCHEDULED YET</h3>
						</div>
					{:else}
						{#each groupedSchedule as dayGroup}
							{@const roundName = getRoundName(dayGroup.matches)}
							<div class="space-y-6">
								<div class="flex items-center gap-4">
									<div class="h-px flex-1 bg-white/10"></div>
									<h3 class="font-montserrat font-black text-xl text-indigo-400">DAY {dayGroup.day} {roundName ? `- ${roundName}` : ''}</h3>
									<div class="h-px flex-1 bg-white/10"></div>
								</div>
								<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{#each dayGroup.matches as match, i}
										<MatchCard
											{match}
											index={match.match_number - 1}
											level={match.level}
											gender={match.gender}
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
			</div>
		{/if}
	</main>
</div>

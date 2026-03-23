<script>
	import { onMount } from 'svelte';
	import { CategoryFilter } from '$lib/components/features';
	import { ScoreModal, MatchTable, ScheduleMatchCard } from '$lib/components/features/SchedulePage';
	import { scheduleService, matchService } from '$lib/services';

	let activeTab = $state('All');
	let activeDayTab = $state('Day 1');
	let viewModes = $state({});
	
	let scoreModal = $state({
		isOpen: false,
		match: null,
		score1: '',
		score2: ''
	});

	let scheduleData = $state([]);
	let matchScores = $state({});

	// Load data on mount
	onMount(async () => {
		try {
			// Load all matches from new matches table
			scheduleData = await matchService.getMatches();
			matchScores = await scheduleService.getScores();
		} catch (error) {
			console.error('Failed to load schedule data:', error);
		}
	});

	// Computed values
	const tabs = ['All', 'SMA Putra', 'SMA Putri', 'SMP Putra', 'SMP Putri'];
	let dayTabs = $derived(Array.from({ length: 13 }, (_, i) => `Day ${i + 1}`));
	
	let filteredSchedule = $derived(
		activeTab === 'All' 
			? scheduleData 
			: scheduleData.filter(m => m.category === activeTab)
	);
	
	let dayFilteredSchedule = $derived(
		filteredSchedule.filter(m => m.day === parseInt(activeDayTab.replace('Day ', '')))
	);

	let groupedSchedule = $derived.by(() => {
		const groups = {};
		dayFilteredSchedule.forEach(match => {
			if (!groups[match.day]) groups[match.day] = [];
			groups[match.day].push(match);
		});
		return Object.keys(groups)
			.map(day => ({ day: parseInt(day), matches: groups[day] }))
			.sort((a, b) => a.day - b.day);
	});

	// View mode functions
	function toggleViewMode(day) {
		viewModes[day] = viewModes[day] === 'table' ? 'card' : 'table';
	}

	function getViewMode(day) {
		return viewModes[day] || 'table';
	}

	// Score modal functions
	function openScoreModal(match) {
		const existingScore = scheduleService.getMatchScore(match);
		scoreModal = {
			isOpen: true,
			match: match,
			score1: existingScore?.score1 || '',
			score2: existingScore?.score2 || ''
		};
	}

	function closeScoreModal() {
		scoreModal.isOpen = false;
		scoreModal.match = null;
		scoreModal.score1 = '';
		scoreModal.score2 = '';
	}

	async function saveScore() {
		if (!scoreModal.match) return;
		try {
			// Save score using existing scheduleService
			const scoreKey = `${scoreModal.match.day}-M${String(scoreModal.match.match_number).padStart(2, '0')}-${scoreModal.match.category.toLowerCase().replace(' ', '-')}`;
			await scheduleService.saveScore(scoreKey, scoreModal.score1, scoreModal.score2);
			
			// Update match status to Complete directly via Supabase
			// For now, we'll skip the API call and just reload data
			// The status will be determined by whether score exists
			
			// Reload data
			scheduleData = await matchService.getMatches();
			matchScores = await scheduleService.getScores();
			
			closeScoreModal();
		} catch (error) {
			console.error('Failed to save score:', error);
			alert('Failed to save score. Please try again.');
		}
	}

	// Helper functions
	function getActualDate(dayNum) {
		const startDate = new Date('2026-03-24'); // Updated to match tournament dates
		startDate.setDate(startDate.getDate() + (dayNum - 1));
		return startDate.toLocaleDateString('id-ID', { 
			weekday: 'long', 
			day: 'numeric', 
			month: 'long', 
			year: 'numeric' 
		});
	}

	function getRoundInfo(day) {
		if (day === 13) return { label: 'Final', color: 'bg-amber-50 text-amber-700 border-amber-200' };
		if (day >= 11) return { label: 'Semi Final', color: 'bg-rose-50 text-rose-700 border-rose-200' };
		if (day >= 7) return { label: '8 Besar', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
		return { label: '16 Besar', color: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
	}

	function exportSchedulePDF() {
		// Use existing pdfService with new data structure
		const pdfData = scheduleData.map(match => ({
			...match,
			matchStrId: `M${String(match.match_number).padStart(2, '0')}`,
			time: match.match_time
		}));
		// pdfService.generateSchedulePDF(pdfData, matchScores);
	}

	// Check if match is complete based on whether score exists
	function isMatchComplete(match) {
		const score = getMatchScore(match);
		return score && score.score1 !== undefined && score.score2 !== undefined;
	}

	// Get match score (keep existing logic for compatibility)
	function getMatchScore(match) {
		const scoreKey = `${match.day}-M${String(match.match_number).padStart(2, '0')}-${match.category.toLowerCase().replace(' ', '-')}`;
		return matchScores[scoreKey] || null;
	}
</script>

<svelte:head>
	<title>Match Schedule | Yadika Cup</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-neutral-50 via-white to-neutral-50/50 flex flex-col">
	<!-- Header -->
	<header class="bg-white/90 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
		<div class="px-8 py-5 flex items-center justify-between flex-wrap gap-4">
			<div>
				<h1 class="font-montserrat text-2xl font-extrabold text-neutral-900">Match Schedule</h1>
				<p class="text-xs text-neutral-400 mt-1">13-Day Tournament · Yadika Cup</p>
			</div>

			<div class="flex items-center gap-3">
				<!-- PDF Export Button -->
				<button 
					onclick={exportSchedulePDF}
					class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-poppins font-semibold text-sm rounded-lg transition-colors shadow-sm"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
						<polyline points="14 2 14 8 20 8"/>
						<line x1="16" y1="13" x2="8" y2="13"/>
						<line x1="16" y1="17" x2="8" y2="17"/>
						<polyline points="10 9 9 9 8 9"/>
					</svg>
					Export PDF
				</button>

				<!-- Category Filter -->
				<CategoryFilter {tabs} bind:activeTab />
			</div>
		</div>

		<!-- Day Tabs -->
		<div class="px-8 pb-4 overflow-x-auto scrollbar-none">
			<div class="flex gap-1.5 min-w-max">
				{#each dayTabs as dayTab, i}
					{@const isActive = activeDayTab === dayTab}
					<button 
						class="flex flex-col items-center justify-center min-w-[44px] px-2.5 py-1.5 rounded-lg border-2 transition-all {isActive ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white border-neutral-200 hover:border-indigo-200 hover:bg-indigo-50'}"
						onclick={() => activeDayTab = dayTab}
					>
						<span class="font-montserrat text-base font-extrabold leading-none {isActive ? 'text-white' : 'text-neutral-700'}">{i + 1}</span>
						{#if isActive}
							<span class="text-[9px] font-semibold text-white/70 uppercase tracking-wider mt-0.5">Day</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 px-8 py-7">
		{#if groupedSchedule.length === 0}
			<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-16 text-center">
				<div class="w-18 h-18 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-300"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
				</div>
				<h3 class="font-montserrat text-lg font-bold text-neutral-500">No Matches Found</h3>
				<p class="text-sm text-neutral-400 mt-1">Try selecting a different category or day</p>
			</div>
		{:else}
			{#each groupedSchedule as dayGroup}
				{@const roundInfo = getRoundInfo(dayGroup.day)}
				{@const currentViewMode = getViewMode(dayGroup.day)}
				{@const doneCount = dayGroup.matches.filter(m => isMatchComplete(m)).length}

				<div class="mb-10">
					<!-- Day Header -->
					<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-5 mb-4 flex items-center justify-between flex-wrap gap-3">
						<div class="flex items-center gap-4">
							<div class="w-13 h-13 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-indigo-200">
								<span class="text-[9px] font-bold text-white/65 uppercase tracking-wider">Day</span>
								<span class="font-montserrat text-2xl font-black text-white leading-none">{dayGroup.day}</span>
							</div>
							<div>
								<h2 class="font-montserrat text-lg font-bold text-neutral-900">{getActualDate(dayGroup.day)}</h2>
								<div class="flex items-center gap-2 mt-1">
									<span class="text-xs font-poppins font-bold px-2.5 py-0.5 rounded-full border {roundInfo.color}">{roundInfo.label}</span>
									<span class="text-xs text-neutral-400 font-medium">{dayGroup.matches.length} matches</span>
									{#if doneCount > 0}
										<span class="text-xs text-green-600 font-semibold">{doneCount}/{dayGroup.matches.length} complete</span>
									{/if}
								</div>
							</div>
						</div>

						<!-- View Toggle -->
						<div class="flex bg-neutral-100 rounded-xl p-0.5 gap-0.5">
							<button 
								class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-poppins text-xs font-semibold transition-all {currentViewMode === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-neutral-500'}"
								onclick={() => toggleViewMode(dayGroup.day)}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
								Cards
							</button>
							<button 
								class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-poppins text-xs font-semibold transition-all {currentViewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-neutral-500'}"
								onclick={() => toggleViewMode(dayGroup.day)}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
								Table
							</button>
						</div>
					</div>

					<!-- Matches Display -->
					{#if currentViewMode === 'card'}
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
							{#each dayGroup.matches as match}
								<ScheduleMatchCard 
									{match}
									isComplete={isMatchComplete(match)}
									score={getMatchScore(match)}
									onInputScore={() => openScoreModal(match)}
								/>
							{/each}
						</div>
					{:else}
						<MatchTable 
							matches={dayGroup.matches}
							onOpenScoreModal={openScoreModal}
							isMatchComplete={isMatchComplete}
							getMatchScore={getMatchScore}
						/>
					{/if}
				</div>
			{/each}
		{/if}
	</main>
</div>

<!-- Score Modal -->
<ScoreModal 
	isOpen={scoreModal.isOpen}
	match={scoreModal.match}
	bind:score1={scoreModal.score1}
	bind:score2={scoreModal.score2}
	onClose={closeScoreModal}
	onSave={saveScore}
/>

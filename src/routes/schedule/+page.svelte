<script>
	import { onMount } from 'svelte';
	import { CategoryFilter } from '$lib/components/features';
	import { ScoreModal, MatchTable, ScheduleMatchCard } from '$lib/components/features/SchedulePage';
	import { scheduleService } from '$lib/services/scheduleService.js';
	import { generateScheduleData } from '$lib/services/scheduleGenerator.js';

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
	onMount(() => {
		scheduleData = generateScheduleData();
		matchScores = scheduleService.getScores();
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

	function saveScore() {
		if (!scoreModal.match) return;
		const scoreKey = `${scoreModal.match.day}-${scoreModal.match.matchStrId}-${scoreModal.match.category}`;
		scheduleService.saveScore(scoreKey, { 
			score1: scoreModal.score1, 
			score2: scoreModal.score2 
		});
		matchScores = scheduleService.getScores();
		closeScoreModal();
	}

	// Helper functions
	function getActualDate(dayNum) {
		const startDate = new Date('2025-05-10');
		startDate.setDate(startDate.getDate() + (dayNum - 1));
		return startDate.toLocaleDateString('id-ID', { 
			weekday: 'long', 
			day: 'numeric', 
			month: 'long', 
			year: 'numeric' 
		});
	}

	function getRoundInfo(day) {
		if (day === 13) return { label: 'Grand Final', color: 'bg-amber-50 text-amber-700 border-amber-200' };
		if (day >= 11) return { label: 'Semi Final', color: 'bg-rose-50 text-rose-700 border-rose-200' };
		if (day >= 7) return { label: 'Quarter Final', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
		return { label: 'Round of 16', color: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
	}
</script>

<svelte:head>
	<title>Match Schedule | Yadika Cup</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50 flex flex-col">
	<!-- Header -->
	<header class="bg-white/90 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
		<div class="px-8 py-5 flex items-center justify-between flex-wrap gap-4">
			<div>
				<h1 class="font-montserrat text-2xl font-extrabold text-neutral-900">Match Schedule</h1>
				<p class="text-xs text-neutral-400 mt-1">13-Day Tournament · Yadika Cup</p>
			</div>

			<!-- Category Filter -->
			<CategoryFilter {tabs} bind:activeTab />
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
				{@const doneCount = dayGroup.matches.filter(m => scheduleService.isMatchComplete(m)).length}

				<div class="mb-10">
					<!-- Day Header -->
					<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-5 mb-4 flex items-center justify-between flex-wrap gap-3">
						<div class="flex items-center gap-4">
							<div class="w-13 h-13 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-indigo-200">
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
									isComplete={scheduleService.isMatchComplete(match)}
									score={scheduleService.getMatchScore(match)}
									onInputScore={() => openScoreModal(match)}
								/>
							{/each}
						</div>
					{:else}
						<MatchTable 
							matches={dayGroup.matches}
							onOpenScoreModal={openScoreModal}
							isMatchComplete={(match) => scheduleService.isMatchComplete(match)}
							getMatchScore={(match) => scheduleService.getMatchScore(match)}
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

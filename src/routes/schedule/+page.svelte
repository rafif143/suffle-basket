<script>
	import { onMount } from 'svelte';
	import { CategoryFilter } from '$lib/components/features';
	import { ScoreModal, MatchTable, ScheduleMatchCard, TestProcessModal } from '$lib/components/features/SchedulePage';
	import { scheduleService, pdfService } from '$lib/services';
	import { auth } from '$lib/stores/auth.svelte.js';
	import { toast } from '$lib/stores/toast.svelte.js';
	import { CATEGORY_LABELS, PAGE_SIZE, TOTAL_DAYS } from '$lib/constants/tournament';
	import { generateMatchKey, test16Besar, test8Besar, testSemiFinal } from '$lib/utils/testHelpers';

	let activeTab = $state(CATEGORY_LABELS[0]);
	let activeDayTab = $state('Day 1');
	let viewModes = $state({});
	let showExportMenu = $state(false);

	let scoreModal = $state({ isOpen: false, match: null, score1: '', score2: '' });
	let testModal = $state({ isOpen: false, title: '', logs: [], isComplete: false });
	let scheduleData = $state([]);
	let matchScores = $state({});

	onMount(async () => {
		try {
			const data = await scheduleService.getSchedule();
			scheduleData = data.map((match) => ({
				...match,
				match_number: extractMatchNumber(match.matchStrId),
				match_time: match.time,
				category: match.category,
			}));
			matchScores = await scheduleService.getScores();
		} catch (error) {
			console.error('Failed to load schedule data:', error);
		}
	});

	function extractMatchNumber(matchStrId) {
		if (!matchStrId) return 1;
		if (matchStrId.startsWith('M')) return parseInt(matchStrId.replace('M', ''));
		if (matchStrId.startsWith('QF')) return parseInt(matchStrId.replace('QF', ''));
		if (matchStrId.startsWith('SF')) return parseInt(matchStrId.replace('SF', ''));
		if (matchStrId.startsWith('F')) return 1;
		return 1;
	}

	const tabs = CATEGORY_LABELS;
	let dayTabs = $derived(Array.from({ length: TOTAL_DAYS }, (_, i) => `Day ${i + 1}`));

	let filteredSchedule = $derived(
		activeTab === 'All' ? scheduleData : scheduleData.filter((m) => m.category === activeTab)
	);

	let dayFilteredSchedule = $derived(
		filteredSchedule.filter((m) => m.day === parseInt(activeDayTab.replace('Day ', '')))
	);

	let groupedSchedule = $derived.by(() => {
		const groups = {};
		dayFilteredSchedule.forEach((match) => {
			if (!groups[match.day]) groups[match.day] = [];
			groups[match.day].push(match);
		});
		return Object.keys(groups)
			.map((day) => ({ day: parseInt(day), matches: groups[day] }))
			.sort((a, b) => a.day - b.day);
	});

	function toggleViewMode(day) {
		viewModes[day] = viewModes[day] === 'table' ? 'card' : 'table';
	}

	function getViewMode(day) {
		return viewModes[day] || 'table';
	}

	function openScoreModal(match) {
		const existingScore = scheduleService.getMatchScore(match);
		scoreModal = {
			isOpen: true,
			match,
			score1: existingScore?.score1 || '',
			score2: existingScore?.score2 || '',
		};
	}

	function closeScoreModal() {
		scoreModal = { isOpen: false, match: null, score1: '', score2: '' };
	}

	async function saveScore() {
		if (!scoreModal.match) return;
		try {
			const scoreKey = generateMatchKey(scoreModal.match);
			await scheduleService.saveScore(scoreKey, scoreModal.score1, scoreModal.score2);
			
			// Optimistic update - langsung update local state
			matchScores = {
				...matchScores,
				[scoreKey]: {
					score1: parseInt(scoreModal.score1),
					score2: parseInt(scoreModal.score2),
				},
			};
			
			closeScoreModal();
			
			// Refetch schedule data to get updated winners (auto-refresh tanpa reload)
			await refreshSchedule();
			toast.success('Score updated successfully!');
		} catch (error) {
			console.error('Failed to save score:', error);
			toast.error('Failed to save score. Please try again.');
		}
	}

	async function refreshSchedule() {
		try {
			const data = await scheduleService.getSchedule();
			scheduleData = data.map((match) => ({
				...match,
				match_number: extractMatchNumber(match.matchStrId),
				match_time: match.time,
				category: match.category,
			}));
			// Also refresh scores
			matchScores = await scheduleService.getScores();
		} catch (error) {
			console.error('Failed to refresh schedule:', error);
		}
	}

	function addLog(message) {
		testModal.logs = [...testModal.logs, message];
	}

	async function testAll16BesarScores() {
		if (scheduleData.length === 0) return alert('No matches found to test.');
		if (!confirm('Test input scores for all 16 Besar matches?')) return;
		
		testModal = { isOpen: true, title: 'Test 16 Besar', logs: [], isComplete: false };
		const result = await test16Besar(scheduleData, addLog);
		testModal.isComplete = true;
		
		toast.success(result.message);
		await refreshSchedule();
	}

	async function testAll8BesarScores() {
		if (scheduleData.length === 0) return alert('No matches found to test.');
		if (!confirm('Test input scores for all 8 Besar matches?')) return;
		
		testModal = { isOpen: true, title: 'Test 8 Besar (QF)', logs: [], isComplete: false };
		const result = await test8Besar(scheduleData, addLog);
		testModal.isComplete = true;
		
		toast.success(result.message);
		await refreshSchedule();
	}

	async function testAllSemiFinalScores() {
		if (scheduleData.length === 0) return alert('No matches found to test.');
		if (!confirm('Test input scores for all Semi Final matches?')) return;
		
		testModal = { isOpen: true, title: 'Test Semi Final', logs: [], isComplete: false };
		const result = await testSemiFinal(scheduleData, addLog);
		testModal.isComplete = true;
		
		toast.success(result.message);
		await refreshSchedule();
	}

	function closeTestModal() {
		testModal.isOpen = false;
	}

	function isMatchComplete(match) {
		const score = getMatchScore(match);
		return score && score.score1 !== undefined && score.score2 !== undefined;
	}

	function getMatchScore(match) {
		const scoreKey = generateMatchKey(match);
		return matchScores[scoreKey] || null;
	}

	function getActualDate(dayNum) {
		const startDate = new Date('2026-03-24');
		startDate.setDate(startDate.getDate() + (dayNum - 1));
		return startDate.toLocaleDateString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	}

	function getRoundInfo(day) {
		if (day === 13) return { label: 'Final', color: 'bg-amber-50 text-amber-700 border-amber-200' };
		if (day >= 11) return { label: 'Semi Final', color: 'bg-rose-50 text-rose-700 border-rose-200' };
		if (day >= 7) return { label: '8 Besar', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
		return { label: '16 Besar', color: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
	}

	function exportFullBracket() {
		const pdfData = scheduleData.map((match) => ({
			...match,
			matchStrId: `M${String(match.match_number).padStart(2, '0')}`,
			time: match.match_time,
		}));
		pdfService.generateBracketPDF('All Categories', pdfData, matchScores);
		showExportMenu = false;
	}

	function exportScheduleOnly() {
		// Filter only 16 Besar matches for coaches
		const r16Matches = scheduleData.filter((m) => m.round === '16 Besar');
		const pdfData = r16Matches.map((match) => ({
			...match,
			matchStrId: `M${String(match.match_number).padStart(2, '0')}`,
			time: match.match_time,
		}));
		pdfService.generateSchedulePDF(pdfData);
		showExportMenu = false;
	}

	function closeExportMenu() {
		showExportMenu = false;
	}
</script>

<svelte:head>
	<title>Match Schedule | Yadika Cup</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-linear-to-br from-neutral-50 via-white to-neutral-50/50">
	<header class="sticky top-0 z-20 border-b border-neutral-200/50 bg-white/90 backdrop-blur-sm">
		<div class="flex flex-wrap items-center justify-between gap-4 px-8 py-5">
			<div>
				<h1 class="font-montserrat text-2xl font-extrabold text-neutral-900">Match Schedule</h1>
				<p class="mt-1 text-xs text-neutral-400">13-Day Tournament · Yadika Cup</p>
			</div>
			<div class="flex items-center gap-3">
				{#if auth.isAuthenticated}
					<!-- Export PDF Dropdown -->
					<div class="relative">
						<button
							onclick={() => (showExportMenu = !showExportMenu)}
							class="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 font-poppins text-xs font-semibold text-neutral-600 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 shrink-0 text-neutral-500">
								<path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 6.75a.75.75 0 0 1 1.5 0v2.546l.943-1.048a.75.75 0 1 1 1.114 1.004l-2.25 2.5a.75.75 0 0 1-1.114 0l-2.25-2.5a.75.75 0 1 1 1.114-1.004l.943 1.048V8.75Z" clip-rule="evenodd" />
							</svg>
							Export PDF
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><path d="m6 9 6 6 6-6"/></svg>
						</button>
						
						{#if showExportMenu}
							<div class="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-neutral-200 bg-white py-2 shadow-xl">
								<button
									onclick={exportFullBracket}
									class="flex w-full items-start gap-3 px-4 py-3 text-left text-sm hover:bg-neutral-50"
								>
									<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h11z"/></svg>
									</div>
									<div>
										<div class="font-poppins font-semibold text-neutral-900">Full Bracket</div>
										<div class="text-xs text-neutral-500">All rounds with scores</div>
									</div>
								</button>
								<div class="my-1 border-t border-neutral-100"></div>
								<button
									onclick={exportScheduleOnly}
									class="flex w-full items-start gap-3 px-4 py-3 text-left text-sm hover:bg-neutral-50"
								>
									<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
									</div>
									<div>
										<div class="font-poppins font-semibold text-neutral-900">Schedule Only</div>
										<div class="text-xs text-neutral-500">16 Besar only (for coaches)</div>
									</div>
								</button>
							</div>
							<button class="fixed inset-0 z-40" onclick={closeExportMenu} aria-label="Close export menu"></button>
						{/if}
					</div>
					<div class="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-100 p-1">
						<button onclick={testAll16BesarScores} class="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 font-poppins text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700" title="Auto-fill scores for all 16 Besar matches">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
							Test 16 Besar
						</button>
						<button onclick={testAll8BesarScores} class="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 font-poppins text-xs font-semibold text-neutral-600 transition-all hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600" title="Auto-fill scores for all 8 Besar (QF) matches">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
							Test 8 Besar
						</button>
						<button onclick={testAllSemiFinalScores} class="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 font-poppins text-xs font-semibold text-neutral-600 transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600" title="Auto-fill scores for all Semi Final matches">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
							Test SF
						</button>
					</div>
				{/if}
				<CategoryFilter {tabs} bind:activeTab />
			</div>
		</div>
		<div class="overflow-x-auto scrollbar-none px-8 pb-4">
			<div class="flex gap-1.5 min-w-max">
				{#each dayTabs as dayTab, i}
					{@const isActive = activeDayTab === dayTab}
					<button
						onclick={() => (activeDayTab = dayTab)}
						class="flex min-w-[44px] flex-col items-center justify-center rounded-lg border-2 px-2.5 py-1.5 transition-all {isActive ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'border-neutral-200 bg-white text-neutral-700 hover:border-indigo-200 hover:bg-indigo-50'}"
					>
						<span class="font-montserrat text-base font-extrabold leading-none">{i + 1}</span>
						{#if isActive}
							<span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/70">Day</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</header>
	<main class="flex-1 px-8 py-7">
		{#if groupedSchedule.length === 0}
			<div class="rounded-2xl border border-neutral-200/50 bg-white/95 p-16 text-center backdrop-blur-sm">
				<div class="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-2xl bg-indigo-50">
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-300"><rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
				</div>
				<h3 class="font-montserrat text-lg font-bold text-neutral-500">No Matches Found</h3>
				<p class="mt-1 text-sm text-neutral-400">Try selecting a different category or day</p>
			</div>
		{:else}
			{#each groupedSchedule as dayGroup}
				{@const roundInfo = getRoundInfo(dayGroup.day)}
				{@const currentViewMode = getViewMode(dayGroup.day)}
				{@const doneCount = dayGroup.matches.filter((m) => isMatchComplete(m)).length}
				<div class="mb-10">
					<div class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200/50 bg-white/95 p-5 backdrop-blur-sm">
						<div class="flex items-center gap-4">
							<div class="flex h-13 w-13 flex-col items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200">
								<span class="text-[9px] font-bold leading-none text-white/65">Day</span>
								<span class="font-montserrat text-2xl font-black leading-none text-white">{dayGroup.day}</span>
							</div>
							<div>
								<h2 class="font-montserrat text-lg font-bold text-neutral-900">{getActualDate(dayGroup.day)}</h2>
								<div class="mt-1 flex items-center gap-2">
									<span class="rounded-full border px-2.5 py-0.5 text-xs font-bold {roundInfo.color}">{roundInfo.label}</span>
									<span class="text-xs font-medium text-neutral-400">{dayGroup.matches.length} matches</span>
									{#if doneCount > 0}
										<span class="text-xs font-semibold text-green-600">{doneCount}/{dayGroup.matches.length} complete</span>
									{/if}
								</div>
							</div>
						</div>
						<div class="flex gap-0.5 rounded-xl bg-neutral-100 p-0.5">
							<button
								onclick={() => toggleViewMode(dayGroup.day)}
								class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-poppins text-xs font-semibold transition-all {currentViewMode === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-neutral-500'}"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
								Cards
							</button>
							<button
								onclick={() => toggleViewMode(dayGroup.day)}
								class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-poppins text-xs font-semibold transition-all {currentViewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-neutral-500'}"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
								Table
							</button>
						</div>
					</div>
					{#if currentViewMode === 'card'}
						<div class="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
							{#each dayGroup.matches as match}
								<ScheduleMatchCard
									{match}
									isComplete={isMatchComplete(match)}
									score={getMatchScore(match)}
									onInputScore={auth.isAuthenticated ? () => openScoreModal(match) : null}
									isReadyToPlay={match.isReadyToPlay !== false && match.team1 !== 'TBD' && match.team2 !== 'TBD' && !match.team1?.startsWith('Winner ') && !match.team2?.startsWith('Winner ')}
								/>
							{/each}
						</div>
					{:else}
						<MatchTable
							matches={dayGroup.matches}
							onOpenScoreModal={auth.isAuthenticated ? openScoreModal : null}
							isMatchComplete={isMatchComplete}
							getMatchScore={getMatchScore}
						/>
					{/if}
				</div>
			{/each}
		{/if}
	</main>
	<ScoreModal isOpen={scoreModal.isOpen} match={scoreModal.match} bind:score1={scoreModal.score1} bind:score2={scoreModal.score2} onClose={closeScoreModal} onSave={saveScore} />
	<TestProcessModal isOpen={testModal.isOpen} title={testModal.title} logs={testModal.logs} isComplete={testModal.isComplete} onClose={closeTestModal} />
</div>

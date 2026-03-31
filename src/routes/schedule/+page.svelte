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
			// Load schedule from /schedule endpoint (uses draw_results with correct 6 matches/day logic)
			const scheduleResponse = await fetch('/api/schedule');
			const scheduleJson = await scheduleResponse.json();

			if (scheduleJson.success) {
				// Transform schedule data to match expected format
				scheduleData = scheduleJson.data.map((match) => {
					// Extract match_number from matchStrId (handles M01, QF1, SF1, F1)
					let match_number;
					if (match.matchStrId.startsWith('M')) {
						match_number = parseInt(match.matchStrId.replace('M', ''));
					} else if (match.matchStrId.startsWith('QF')) {
						match_number = parseInt(match.matchStrId.replace('QF', ''));
					} else if (match.matchStrId.startsWith('SF')) {
						match_number = parseInt(match.matchStrId.replace('SF', ''));
					} else if (match.matchStrId.startsWith('F')) {
						match_number = 1; // Final only has 1 match
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

			matchScores = await scheduleService.getScores();
		} catch (error) {
			console.error('Failed to load schedule data:', error);
		}
	});

	// Computed values
	const tabs = ['All', 'SMA Putra', 'SMA Putri', 'SMP Putra', 'SMP Putri'];
	let dayTabs = $derived(Array.from({ length: 13 }, (_, i) => `Day ${i + 1}`));

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
			// Use consistent match_key generation
			const scoreKey = generateMatchKey(scoreModal.match);
			await scheduleService.saveScore(scoreKey, scoreModal.score1, scoreModal.score2);

			// Optimistic local update — langsung update matchScores tanpa refetch
			matchScores = {
				...matchScores,
				[scoreKey]: {
					score1: parseInt(scoreModal.score1),
					score2: parseInt(scoreModal.score2)
				}
			};

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
		if (day >= 11)
			return { label: 'Semi Final', color: 'bg-rose-50 text-rose-700 border-rose-200' };
		if (day >= 7)
			return { label: '8 Besar', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
		return { label: '16 Besar', color: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
	}

	function exportSchedulePDF() {
		// Use existing pdfService with new data structure
		const pdfData = scheduleData.map((match) => ({
			...match,
			matchStrId: `M${String(match.match_number).padStart(2, '0')}`,
			time: match.match_time
		}));
		// pdfService.generateSchedulePDF(pdfData, matchScores);
	}

	// TEST FUNCTION: Input all 16 Besar scores
	async function testAll16BesarScores() {
		console.log('🧪 Test 16 Besar - Total scheduleData:', scheduleData.length);
		console.log(
			'🧪 Available matches:',
			scheduleData
				.map((m) => `${m.round} (${m.category})`)
				.join(', ')
				.substring(0, 200)
		);

		const r16Matches = scheduleData.filter((m) => m.round === '16 Besar');
		console.log('🧪 16 Besar matches found:', r16Matches.length);

		if (r16Matches.length === 0) {
			console.error('❌ No 16 Besar matches in scheduleData!');
			return alert(
				'No 16 Besar matches found to test. Make sure draw has been completed and matches are generated.'
			);
		}

		if (
			!confirm(
				`Test input scores for ${r16Matches.length} matches in 16 Besar? This will auto-fill scores and resolve winners for 8 Besar.`
			)
		)
			return;

		let successCount = 0;
		let failCount = 0;

		for (const match of r16Matches) {
			const scoreKey = generateMatchKey(match);
			// Alternating scores to ensure clear winners
			const s1 = match.match_number % 2 === 0 ? 25 : 15;
			const s2 = match.match_number % 2 === 0 ? 15 : 25;

			console.log(
				`📝 Saving score for ${match.category} ${match.round} M${match.match_number}: ${scoreKey} = ${s1}-${s2}`
			);

			try {
				await scheduleService.saveScore(scoreKey, s1, s2);
				successCount++;
				console.log(`✅ Success: ${scoreKey}`);
			} catch (err) {
				failCount++;
				console.error(`❌ Failed to save test score for ${scoreKey}:`, err.message);
			}
		}

		console.log(`🎉 Test complete! Success: ${successCount}, Failed: ${failCount}`);
		alert(
			`Successfully saved ${successCount} test scores.${failCount > 0 ? ` (${failCount} failed)` : ''} Refreshing to show 8 Besar winners...`
		);
		location.reload(); // Quickest way to refresh everything
	}

	// TEST FUNCTION: Input all 8 Besar (Quarter Final) scores
	async function testAll8BesarScores() {
		console.log('🧪 Test 8 Besar - Total scheduleData:', scheduleData.length);

		const qfMatches = scheduleData.filter((m) => m.round === '8 Besar');
		console.log('🧪 8 Besar matches found:', qfMatches.length);

		if (qfMatches.length === 0) {
			console.error('❌ No 8 Besar matches in scheduleData!');
			return alert('No 8 Besar matches found to test. Make sure 16 Besar has been completed.');
		}

		if (
			!confirm(
				`Test input scores for ${qfMatches.length} matches in 8 Besar? This will auto-fill scores and resolve winners for Semi Final.`
			)
		)
			return;

		let successCount = 0;
		let failCount = 0;

		for (const match of qfMatches) {
			const scoreKey = generateMatchKey(match);
			// Alternating scores to ensure clear winners
			const s1 = match.match_number % 2 === 0 ? 28 : 22;
			const s2 = match.match_number % 2 === 0 ? 20 : 24;

			console.log(
				`📝 Saving score for ${match.category} ${match.round} QF${match.match_number}: ${scoreKey} = ${s1}-${s2}`
			);

			try {
				await scheduleService.saveScore(scoreKey, s1, s2);
				successCount++;
				console.log(`✅ Success: ${scoreKey}`);
			} catch (err) {
				failCount++;
				console.error(`❌ Failed to save test score for ${scoreKey}:`, err.message);
			}
		}

		console.log(`🎉 Test complete! Success: ${successCount}, Failed: ${failCount}`);
		alert(
			`Successfully saved ${successCount} test scores.${failCount > 0 ? ` (${failCount} failed)` : ''} Refreshing to show Semi Final winners...`
		);
		location.reload(); // Quickest way to refresh everything
	}

	// TEST FUNCTION: Input all Semi Final (4 Besar) scores
	async function testAllSemiFinalScores() {
		console.log('🧪 Test Semi Final - Total scheduleData:', scheduleData.length);

		const sfMatches = scheduleData.filter((m) => m.round === 'Semi Final');
		console.log('🧪 Semi Final matches found:', sfMatches.length);

		if (sfMatches.length === 0) {
			console.error('❌ No Semi Final matches in scheduleData!');
			return alert('No Semi Final matches found to test. Make sure 8 Besar has been completed.');
		}

		if (
			!confirm(
				`Test input scores for ${sfMatches.length} matches in Semi Final? This will auto-fill scores and resolve winners for Final.`
			)
		)
			return;

		let successCount = 0;
		let failCount = 0;

		for (const match of sfMatches) {
			const scoreKey = generateMatchKey(match);
			// Alternating scores to ensure clear winners
			const s1 = match.match_number % 2 === 0 ? 35 : 27;
			const s2 = match.match_number % 2 === 0 ? 23 : 31;

			console.log(
				`📝 Saving score for ${match.category} ${match.round} SF${match.match_number}: ${scoreKey} = ${s1}-${s2}`
			);

			try {
				await scheduleService.saveScore(scoreKey, s1, s2);
				successCount++;
				console.log(`✅ Success: ${scoreKey}`);
			} catch (err) {
				failCount++;
				console.error(`❌ Failed to save test score for ${scoreKey}:`, err.message);
			}
		}

		console.log(`🎉 Test complete! Success: ${successCount}, Failed: ${failCount}`);
		alert(
			`Successfully saved ${successCount} test scores.${failCount > 0 ? ` (${failCount} failed)` : ''} Refreshing to show Final matchups...`
		);
		location.reload(); // Quickest way to refresh everything
	}

	// Check if match is complete based on whether score exists
	function isMatchComplete(match) {
		const score = getMatchScore(match);
		return score && score.score1 !== undefined && score.score2 !== undefined;
	}

	// Helper function: Generate consistent match_key for all rounds
	function generateMatchKey(match) {
		const day = match.day;
		const round = match.round;
		const match_number = match.match_number || match.matchStrId.replace(/[A-Z]/g, '');

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

	// Get match score - FIXED to use consistent match_key
	function getMatchScore(match) {
		const scoreKey = generateMatchKey(match);
		return matchScores[scoreKey] || null;
	}
</script>

<svelte:head>
	<title>Match Schedule | Yadika Cup</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-linear-to-br from-neutral-50 via-white to-neutral-50/50">
	<!-- Header -->
	<header class="sticky top-0 z-20 border-b border-neutral-200/50 bg-white/90 backdrop-blur-sm">
		<div class="flex flex-wrap items-center justify-between gap-4 px-8 py-5">
			<div>
				<h1 class="font-montserrat text-2xl font-extrabold text-neutral-900">Match Schedule</h1>
				<p class="mt-1 text-xs text-neutral-400">13-Day Tournament · Yadika Cup</p>
			</div>

			<div class="flex items-center gap-3">
				<!-- PDF Export Button -->
				<button
					onclick={exportSchedulePDF}
					class="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 font-poppins text-xs font-semibold text-neutral-600 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900"
				>
					<!-- Heroicon: document-arrow-down -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="h-4 w-4 shrink-0 text-neutral-500"
					>
						<path
							fill-rule="evenodd"
							d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 6.75a.75.75 0 0 1 1.5 0v2.546l.943-1.048a.75.75 0 1 1 1.114 1.004l-2.25 2.5a.75.75 0 0 1-1.114 0l-2.25-2.5a.75.75 0 1 1 1.114-1.004l.943 1.048V8.75Z"
							clip-rule="evenodd"
						/>
					</svg>
					Export PDF
				</button>

				<!-- Test Scores Buttons -->
				<div
					class="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-100 p-1"
				>
					<!-- Test All 16 Besar -->
					<button
						onclick={testAll16BesarScores}
						class="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 font-poppins text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
						title="Auto-fill scores for all 16 Besar matches"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="m9 11 3 3L22 4" /><path
								d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
							/></svg
						>
						Test 16 Besar
					</button>

					<!-- Test All 8 Besar -->
					<button
						onclick={testAll8BesarScores}
						class="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 font-poppins text-xs font-semibold text-neutral-600 transition-all hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
						title="Auto-fill scores for all 8 Besar (QF) matches"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="m9 11 3 3L22 4" /><path
								d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
							/></svg
						>
						Test 8 Besar
					</button>

					<!-- Test Semi Final (4 Besar) -->
					<button
						onclick={testAllSemiFinalScores}
						class="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 font-poppins text-xs font-semibold text-neutral-600 transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
						title="Auto-fill scores for all Semi Final matches"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="m9 11 3 3L22 4" /><path
								d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
							/></svg
						>
						Test SF
					</button>
				</div>

				<!-- Category Filter -->
				<CategoryFilter {tabs} bind:activeTab />
			</div>
		</div>

		<!-- Day Tabs -->
		<div class="scrollbar-none overflow-x-auto px-8 pb-4">
			<div class="flex min-w-max gap-1.5">
				{#each dayTabs as dayTab, i}
					{@const isActive = activeDayTab === dayTab}
					<button
						class="flex min-w-[44px] flex-col items-center justify-center rounded-lg border-2 px-2.5 py-1.5 transition-all {isActive
							? 'border-indigo-600 bg-indigo-600 shadow-lg shadow-indigo-200'
							: 'border-neutral-200 bg-white hover:border-indigo-200 hover:bg-indigo-50'}"
						onclick={() => (activeDayTab = dayTab)}
					>
						<span
							class="font-montserrat text-base leading-none font-extrabold {isActive
								? 'text-white'
								: 'text-neutral-700'}">{i + 1}</span
						>
						{#if isActive}
							<span class="mt-0.5 text-[9px] font-semibold tracking-wider text-white/70 uppercase"
								>Day</span
							>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 px-8 py-7">
		{#if groupedSchedule.length === 0}
			<div
				class="rounded-2xl border border-neutral-200/50 bg-white/95 p-16 text-center backdrop-blur-sm"
			>
				<div
					class="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-2xl bg-indigo-50"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="36"
						height="36"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="text-indigo-300"
						><rect width="18" height="18" x="3" y="4" rx="2" /><line
							x1="16"
							y1="2"
							x2="16"
							y2="6"
						/><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg
					>
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
					<!-- Day Header -->
					<div
						class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200/50 bg-white/95 p-5 backdrop-blur-sm"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-13 w-13 flex-col items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200"
							>
								<span class="text-[9px] font-bold tracking-wider text-white/65 uppercase">Day</span>
								<span class="font-montserrat text-2xl leading-none font-black text-white"
									>{dayGroup.day}</span
								>
							</div>
							<div>
								<h2 class="font-montserrat text-lg font-bold text-neutral-900">
									{getActualDate(dayGroup.day)}
								</h2>
								<div class="mt-1 flex items-center gap-2">
									<span
										class="rounded-full border px-2.5 py-0.5 font-poppins text-xs font-bold {roundInfo.color}"
										>{roundInfo.label}</span
									>
									<span class="text-xs font-medium text-neutral-400"
										>{dayGroup.matches.length} matches</span
									>
									{#if doneCount > 0}
										<span class="text-xs font-semibold text-green-600"
											>{doneCount}/{dayGroup.matches.length} complete</span
										>
									{/if}
								</div>
							</div>
						</div>

						<!-- View Toggle -->
						<div class="flex gap-0.5 rounded-xl bg-neutral-100 p-0.5">
							<button
								class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-poppins text-xs font-semibold transition-all {currentViewMode ===
								'card'
									? 'bg-white text-indigo-600 shadow-sm'
									: 'text-neutral-500'}"
								onclick={() => toggleViewMode(dayGroup.day)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><rect x="3" y="3" width="7" height="7" /><rect
										x="14"
										y="3"
										width="7"
										height="7"
									/><rect x="14" y="14" width="7" height="7" /><rect
										x="3"
										y="14"
										width="7"
										height="7"
									/></svg
								>
								Cards
							</button>
							<button
								class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-poppins text-xs font-semibold transition-all {currentViewMode ===
								'table'
									? 'bg-white text-indigo-600 shadow-sm'
									: 'text-neutral-500'}"
								onclick={() => toggleViewMode(dayGroup.day)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line
										x1="3"
										y1="18"
										x2="21"
										y2="18"
									/></svg
								>
								Table
							</button>
						</div>
					</div>

					<!-- Matches Display -->
					{#if currentViewMode === 'card'}
						<div class="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
							{#each dayGroup.matches as match}
								<ScheduleMatchCard
									{match}
									isComplete={isMatchComplete(match)}
									score={getMatchScore(match)}
									onInputScore={() => openScoreModal(match)}
									isReadyToPlay={match.isReadyToPlay !== false &&
										match.team1 !== 'TBD' &&
										match.team2 !== 'TBD' &&
										!match.team1?.startsWith('Winner ') &&
										!match.team2?.startsWith('Winner ')}
								/>
							{/each}
						</div>
					{:else}
						<MatchTable
							matches={dayGroup.matches}
							onOpenScoreModal={openScoreModal}
							{isMatchComplete}
							{getMatchScore}
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

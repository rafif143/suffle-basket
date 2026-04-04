<script>
	import { onMount } from 'svelte';
	import { NotificationModal, PublicNavbar } from '$lib/components/ui';
	import { MatchCard } from '$lib/components/features';
	import { TeamInput } from '$lib/components/features/DrawPage';
	import { DrawControls, ShuffleModal, DevModeControls } from '$lib/components/features/DrawPage';
import { TestProcessModal } from '$lib/components/features/SchedulePage';
	import { auth } from '$lib/stores/auth.svelte.js';
	import { drawService, scheduleService, pdfService } from '$lib/services';
	import { getMatchDay, getMatchTime, getMatchIndexInDay } from '$lib/utils';
	import { apiCache } from '$lib/utils/cache.js';
	import { MATCHES_PER_CATEGORY, LEVELS, GENDERS, CATEGORY_LABELS, SHUFFLE_DURATION, SHUFFLE_INTERVAL } from '$lib/constants/draw';

	let activeLevel = $state(LEVELS[0]);
	let activeGender = $state(GENDERS[0]);

	let teamsInput = $state([]);
	let drawResults = $state(Array(MATCHES_PER_CATEGORY).fill({ team1: 'TBD', team2: 'TBD' }));
	let matchScores = $state({});
	let isShuffling = $state(false);

	// Modal states
	let shuffleModal = $state({
		isOpen: false,
		isShuffling: false,
		team1: '???',
		team2: '???',
		matchIndex: -1,
	});

	let devModal = $state({ isOpen: false, title: '', message: '', isProcessing: false });
	let testModal = $state({ isOpen: false, title: '', logs: [], isComplete: false });

	let currentMatchIndex = $derived(drawResults.findIndex(m => m.team1 === 'TBD' || m.team2 === 'TBD'));
	let completedMatches = $derived(MATCHES_PER_CATEGORY - 1 - currentMatchIndex);
	let shuffleDay = $derived(getMatchDay(activeLevel, activeGender, shuffleModal.matchIndex));
	let shuffleTime = $derived(getMatchTime(shuffleDay, getMatchIndexInDay(activeLevel, activeGender, shuffleModal.matchIndex)));
	let category = $derived(`${activeLevel} ${activeGender}`);

	onMount(() => {
		loadData();
		loadScores();
	});

	async function loadData() {
		try {
			const cat = `${activeLevel.toLowerCase()}-${activeGender.toLowerCase()}`;
			if (auth.isAuthenticated) {
				teamsInput = await drawService.getTeams(cat);
			}
			drawResults = await drawService.getResults(cat);
		} catch (error) {
			console.error('Failed to load draw data:', error);
		}
	}

	async function loadScores() {
		try {
			matchScores = await scheduleService.getScores();
		} catch (error) {
			console.error('Failed to load scores:', error);
		}
	}

	function handleShuffle() {
		if (isShuffling) return;
		const nextIdx = drawResults.findIndex(m => m.team1 === 'TBD' || m.team2 === 'TBD');
		if (nextIdx === -1) return;
		
		shuffleModal = {
			...shuffleModal,
			isOpen: true,
			team1: '???',
			team2: '???',
			message: `Ready to draw teams for Match ${nextIdx + 1}?`,
			matchIndex: nextIdx,
		};
	}

	function startActualShuffle() {
		if (isShuffling) return;
		
		const drawnTeams = drawResults.flatMap(m => [m.team1, m.team2]).filter(t => t !== 'TBD' && t !== '?');
		const remainingTeams = teamsInput.filter(t => !drawnTeams.includes(t));
		
		if (remainingTeams.length < 2) {
			alert('Not enough remaining teams to draw a complete match! Please ensure all teams are registered and verified.');
			return;
		}
		
		if (shuffleModal.matchIndex === -1) return;

		isShuffling = true;
		shuffleModal = { ...shuffleModal, isShuffling: true };

		let counter = 0;
		const timer = setInterval(() => {
			counter += SHUFFLE_INTERVAL;
			
			// Show random teams during animation
			const idx1 = Math.floor(Math.random() * remainingTeams.length);
			let idx2 = Math.floor(Math.random() * remainingTeams.length);
			while (idx1 === idx2 && remainingTeams.length > 1) {
				idx2 = Math.floor(Math.random() * remainingTeams.length);
			}
			
			shuffleModal.team1 = remainingTeams[idx1];
			shuffleModal.team2 = remainingTeams[idx2];
			
			if (counter >= SHUFFLE_DURATION) {
				clearInterval(timer);
				const shuffled = [...remainingTeams].sort(() => 0.5 - Math.random());
				const team1 = shuffled[0];
				const team2 = shuffled[1];
				
				shuffleModal = { ...shuffleModal, team1, team2, isShuffling: false };
				
				drawResults[shuffleModal.matchIndex] = { team1, team2 };
				drawResults = [...drawResults];
				
				const cat = `${activeLevel.toLowerCase()}-${activeGender.toLowerCase()}`;
				drawService.saveResults(cat, drawResults)
					.catch(err => {
						console.error('Failed to save draw results:', err);
						alert('Match confirmed locally but failed to save to server. Please check your connection.');
					});
				
				isShuffling = false;
			}
		}, SHUFFLE_INTERVAL);
	}

	function handleGeneratePDF() {
		pdfService.generateBracketPDF(category, drawResults, matchScores);
	}

	async function handleDevAction(action) {
		devModal = {
			isOpen: true,
			title: action === 'draw-all' ? 'Draw All Categories' : '⚠️ Delete All Draw Data',
			message: action === 'draw-all' 
				? 'This will automatically draw all 4 categories with Smart Shuffling. Continue?'
				: 'This will DELETE ALL data from draw_results, matches, and match_scores. This action cannot be undone. Continue?',
			isProcessing: false,
			onConfirm: async () => {
				devModal.isProcessing = true;
				try {
					const data = await drawService.devAction(action);
					if (data.success) {
						if (action === 'draw-all' && data.logs) {
							// Open log modal
							testModal = {
								isOpen: true,
								title: 'Smart Shuffling Progress',
								logs: data.logs,
								isComplete: true
							};
						}
						
						apiCache.clear();
						drawResults = Array(MATCHES_PER_CATEGORY).fill({ team1: 'TBD', team2: 'TBD' });
						teamsInput = [];
						matchScores = {};
						await loadData();
						await loadScores();
					}
				} catch (error) {
					console.error('Failed:', error);
				} finally {
					devModal.isProcessing = false;
					devModal.isOpen = false;
				}
			},
			onCancel: () => (devModal.isOpen = false),
		};
	}

	function closeTestModal() {
		testModal.isOpen = false;
	}

	function closeShuffleModal() {
		shuffleModal = { ...shuffleModal, isOpen: false };
	}

	function handleNextShuffle() {
		const isLastMatch = drawResults.filter(m => m.team1 === 'TBD' || m.team2 === 'TBD').length === 0;
		if (isLastMatch) {
			closeShuffleModal();
		} else {
			handleShuffle();
		}
	}
</script>

<svelte:head>
	<title>Draw | Yadika Cup</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-neutral-50 via-white to-neutral-50/50">
	<header class="border-b border-neutral-200/50 bg-white/80 px-8 py-6 shadow-sm backdrop-blur-md">
		<div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
			<div>
				<h1 class="font-montserrat text-3xl font-black text-neutral-900">Championship Draw</h1>
				<p class="mt-1 font-poppins text-sm text-neutral-500">Generate tournament brackets</p>
			</div>
			<div class="flex flex-wrap gap-3">
				{#if auth.isAuthenticated}
					<div class="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-100 p-1">
						<button onclick={() => handleDevAction('draw-all')} class="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 font-poppins text-xs font-semibold text-white transition-all hover:bg-indigo-700" title="Auto draw all categories">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5 shrink-0"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clip-rule="evenodd" /></svg>
							Draw All
						</button>
						<button onclick={() => handleDevAction('delete-all')} class="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 font-poppins text-xs font-semibold text-neutral-600 transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-600" title="Delete all draw data">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5 shrink-0"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5-.06l.3-7.5Z" clip-rule="evenodd" /></svg>
							Delete All
						</button>
					</div>
				{/if}
				<div class="flex gap-2 rounded-lg bg-neutral-100 p-1">
					{#each LEVELS as lvl}
						<button onclick={() => { activeLevel = lvl; loadData(); loadScores(); }} class="rounded-md px-6 py-2 font-poppins text-sm font-semibold transition-all {activeLevel === lvl ? 'bg-white text-indigo-600 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}">{lvl}</button>
					{/each}
				</div>
				<div class="flex gap-2 rounded-lg bg-neutral-100 p-1">
					{#each GENDERS as gen}
						<button onclick={() => { activeGender = gen; loadData(); loadScores(); }} class="rounded-md px-6 py-2 font-poppins text-sm font-semibold transition-all {activeGender === gen ? 'bg-white text-indigo-600 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}">{gen}</button>
					{/each}
				</div>
			</div>
		</div>
	</header>

	<main class="p-8">
		<div class="grid gap-6 lg:grid-cols-12">
			{#if auth.isAuthenticated}
				<div class="col-span-1 lg:col-span-4">
					<TeamInput bind:teams={teamsInput} activeCategory={`${activeLevel.toLowerCase()}-${activeGender.toLowerCase()}`} {drawResults} />
				</div>
			{/if}
			<div class="col-span-1 {auth.isAuthenticated ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6">
				{#if auth.isAuthenticated}
					<DrawControls {currentMatchIndex} {isShuffling} {completedMatches} onShuffle={handleShuffle} onGeneratePDF={handleGeneratePDF} />
				{/if}
				
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4">
						<h3 class="font-montserrat text-lg font-extrabold text-neutral-900">Draw Results</h3>
						<span class="text-sm font-poppins font-medium text-neutral-600">- {category}</span>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each drawResults as match, index}
						<MatchCard {match} {index} level={activeLevel} gender={activeGender} />
					{/each}
				</div>
			</div>
		</div>
	</main>
</div>

<ShuffleModal 
	isOpen={shuffleModal.isOpen}
	isShuffling={shuffleModal.isShuffling}
	team1={shuffleModal.team1}
	team2={shuffleModal.team2}
	category={category}
	day={shuffleDay}
	time={shuffleTime}
	matchIndex={shuffleModal.matchIndex}
	onStart={startActualShuffle}
	onNext={handleNextShuffle}
	onBackToMenu={closeShuffleModal}
/>

<DevModeControls isOpen={devModal.isOpen} isProcessing={devModal.isProcessing} title={devModal.title} message={devModal.message} onConfirm={devModal.onConfirm} onCancel={devModal.onCancel} />

<TestProcessModal 
	isOpen={testModal.isOpen} 
	title={testModal.title} 
	logs={testModal.logs} 
	isComplete={testModal.isComplete} 
	onClose={closeTestModal} 
/>

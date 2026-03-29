<script>
	import { onMount } from 'svelte';
	import { jsPDF } from "jspdf";
	import autoTable from "jspdf-autotable";
	import { NotificationModal } from '$lib/components/ui';
	import { MatchCard, BracketVisualization } from '$lib/components/features';
	import { TeamInput, DrawControl } from '$lib/components/features/DrawPage';
	import { drawService, scheduleService, pdfService } from '$lib/services';
	import { getMatchDay, getMatchTime, getMatchIndexInDay } from '$lib/utils';
	import { apiCache } from '$lib/utils/cache.js';
	
	let activeLevel = $state('SMA');
	let activeGender = $state('Putra');
	
	let teamsInput = $state([]);
	let drawResults = $state(Array(8).fill({ team1: '?', team2: '?' }));
	let matchScores = $state({});
	let showBracket = $state(false);
	let isShuffling = $state(false);
	let isModalOpen = $state(false);
	let shuffleTeam1 = $state('???');
	let shuffleTeam2 = $state('???');
	let shuffleMatchIndex = $state(-1);
	
	let resetModal = $state({
		isOpen: false,
		title: 'Reset Draw',
		message: 'Are you sure you want to reset all draw results for this category?',
		onConfirm: async () => {
			try {
				const category = `${activeLevel.toLowerCase()}-${activeGender.toLowerCase()}`;
				await drawService.resetDraw(category);
				await loadData();
				resetModal.isOpen = false;
			} catch (error) {
				console.error('Failed to reset draw:', error);
				alert('Failed to reset draw. Please try again.');
			}
		}
	});

	let devModal = $state({
		isOpen: false,
		title: '',
		message: '',
		isProcessing: false,
		onConfirm: null
	});

	let drawModal = $state({
		isOpen: false,
		title: 'Confirm Draw',
		message: '',
		onConfirm: () => {
			drawModal.isOpen = false;
			startActualShuffle();
		}
	});
	
	let currentMatchIndex = $derived(drawResults.findIndex(m => m.team1 === '?' || m.team2 === '?'));
	let shuffleDay = $derived(getMatchDay(activeLevel, activeGender, shuffleMatchIndex));
	let shuffleTime = $derived(getMatchTime(shuffleDay, getMatchIndexInDay(activeLevel, activeGender, shuffleMatchIndex)));

	// Load data on mount only
	onMount(() => {
		loadData();
		loadScores();
	});

	async function loadData() {
		try {
			const category = `${activeLevel.toLowerCase()}-${activeGender.toLowerCase()}`;
			teamsInput = await drawService.getTeams(category);
			drawResults = await drawService.getResults(category);
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
		const nextIdx = drawResults.findIndex(m => m.team1 === '?' || m.team2 === '?');
		if (nextIdx === -1) return;
		drawModal.message = `Ready to draw teams for Match ${nextIdx + 1}? This will select two teams at random from the remaining pool.`;
		drawModal.isOpen = true;
	}

	function startActualShuffle() {
		if (isShuffling) return;
		const drawnTeams = drawResults.flatMap(m => [m.team1, m.team2]).filter(t => t !== '?' && t !== 'TBD');
		const remainingTeams = teamsInput.filter(t => !drawnTeams.includes(t));
		if (remainingTeams.length < 2 || currentMatchIndex === -1) return;

		isShuffling = true;
		isModalOpen = true;
		shuffleMatchIndex = currentMatchIndex;
		
		let counter = 0;
		const duration = 2500;
		const interval = 80;
		const timer = setInterval(async () => {
			counter += interval;
			shuffleTeam1 = remainingTeams[Math.floor(Math.random() * remainingTeams.length)];
			shuffleTeam2 = remainingTeams[Math.floor(Math.random() * remainingTeams.length)];
			if (counter >= duration) {
				clearInterval(timer);
				let shuffled = [...remainingTeams].sort(() => 0.5 - Math.random());
				shuffleTeam1 = shuffled[0];
				shuffleTeam2 = shuffled[1];
				drawResults[shuffleMatchIndex] = { team1: shuffleTeam1, team2: shuffleTeam2 };
				drawResults = [...drawResults];
				const category = `${activeLevel.toLowerCase()}-${activeGender.toLowerCase()}`;
				try {
					await drawService.saveResults(category, drawResults);
				} catch (error) {
					console.error('Failed to save draw results:', error);
				}
				isShuffling = false;
			}
		}, interval);
	}

	function generatePDF() {
		const category = `${activeLevel} ${activeGender}`;
		pdfService.generateBracketPDF(category, drawResults, matchScores);
	}

	// Dev mode functions
	async function handleDrawAll() {
		devModal.title = 'Draw All Categories';
		devModal.message = 'This will automatically draw all 4 categories (SMA Putra, SMA Putri, SMP Putra, SMP Putri). Continue?';
		devModal.onConfirm = async () => {
			devModal.isProcessing = true;
			try {
				const response = await fetch('/api/dev/draw-actions?action=draw-all', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' }
				});
				const data = await response.json();
				
				if (data.success) {
					// Clear cache dulu biar loadData fetch fresh dari server
					apiCache.clear();
					drawResults = Array(8).fill({ team1: '?', team2: '?' });
					await loadData();
					await loadScores();
				} else {
					console.error('Failed to draw all categories');
				}
			} catch (error) {
				console.error('Failed to draw all:', error);
			} finally {
				devModal.isProcessing = false;
				devModal.isOpen = false;
			}
		};
		devModal.isOpen = true;
	}

	async function handleDeleteAll() {
		devModal.title = '⚠️ Delete All Draw Data';
		devModal.message = 'This will DELETE ALL data from draw_results, matches, and match_scores tables. This action cannot be undone. Continue?';
		devModal.onConfirm = async () => {
			devModal.isProcessing = true;
			try {
				const response = await fetch('/api/dev/draw-actions?action=delete-all', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' }
				});
				const data = await response.json();
				
				if (data.success) {
					// Clear cache dulu biar loadData/loadScores fetch fresh dari server
					apiCache.clear();
					// Reset local state langsung biar UI keliatan perubahan tanpa reload
					drawResults = Array(8).fill({ team1: '?', team2: '?' });
					teamsInput = [];
					matchScores = {};
					// Lalu sync ulang dari server
					await loadData();
					await loadScores();
				} else {
					console.error('Failed to delete draw data');
				}
			} catch (error) {
				console.error('Failed to delete all:', error);
			} finally {
				devModal.isProcessing = false;
				devModal.isOpen = false;
			}
		};
		devModal.isOpen = true;
	}
</script>

<svelte:head>
	<title>Draw | Yadika Cup</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-neutral-50 via-white to-neutral-50/50">
	<header class="bg-white/80 backdrop-blur-md border-b border-neutral-200/50 px-8 py-6 shadow-sm">
		<div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
			<div>
				<h1 class="font-montserrat font-black text-3xl text-neutral-900">Championship Draw</h1>
				<p class="font-poppins text-sm text-neutral-500 mt-1">Generate tournament brackets</p>
			</div>
			<div class="flex gap-3 flex-wrap">
				<!-- Dev Mode Buttons -->
				<div class="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 p-1 rounded-xl">
					<button
						onclick={handleDrawAll}
						class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-poppins font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
						title="Auto draw all categories"
					>
						<!-- Heroicon: arrow-path (refresh/draw) -->
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 shrink-0">
							<path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clip-rule="evenodd" />
						</svg>
						Draw All
					</button>
					<button
						onclick={handleDeleteAll}
						class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-poppins font-semibold text-xs bg-white hover:bg-red-50 border border-neutral-200 hover:border-red-200 text-neutral-600 hover:text-red-600 transition-all"
						title="Delete all draw data"
					>
						<!-- Heroicon: trash -->
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 shrink-0">
							<path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
						</svg>
						Delete All
					</button>
				</div>

				<!-- Level Toggle -->
				<div class="flex gap-2 bg-neutral-100 p-1 rounded-lg">
					{#each ['SMA', 'SMP'] as lvl}
						<button
							class="px-6 py-2 rounded-md font-poppins font-semibold text-sm transition-all {activeLevel === lvl
								? 'bg-white text-indigo-600 shadow-sm'
								: 'text-neutral-600 hover:text-neutral-900'}"
							onclick={() => {
								activeLevel = lvl;
								loadData();
								loadScores();
							}}
						>
							{lvl}
						</button>
					{/each}
				</div>

				<!-- Gender Toggle -->
				<div class="flex gap-2 bg-neutral-100 p-1 rounded-lg">
					{#each ['Putra', 'Putri'] as gen}
						<button
							class="px-6 py-2 rounded-md font-poppins font-semibold text-sm transition-all {activeGender === gen
								? 'bg-white text-indigo-600 shadow-sm'
								: 'text-neutral-600 hover:text-neutral-900'}"
							onclick={() => {
								activeGender = gen;
								loadData();
								loadScores();
							}}
						>
							{gen}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</header>

	<main class="p-8">
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
			<div class="col-span-1 lg:col-span-4">
				<TeamInput bind:teams={teamsInput} activeCategory={`${activeLevel.toLowerCase()}-${activeGender.toLowerCase()}`} {drawResults} />
			</div>

			<div class="col-span-1 lg:col-span-8 space-y-6">
				<DrawControl 
					{currentMatchIndex}
					{isShuffling}
					onShuffle={handleShuffle}
					onReset={() => resetModal.isOpen = true}
					onGeneratePDF={generatePDF}
				/>

				<!-- View Toggle -->
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4">
						<h3 class="font-montserrat text-lg font-extrabold text-neutral-900">
							{showBracket ? 'Tournament Bracket' : 'Draw Results'}
						</h3>
						<span class="text-sm font-poppins font-medium text-neutral-600">
							- {activeLevel} {activeGender}
						</span>
					</div>
					<div class="flex bg-neutral-100 rounded-xl p-0.5 gap-0.5">
						<button 
							class="px-4 py-2 rounded-lg font-poppins text-sm font-semibold transition-all {!showBracket ? 'bg-white text-indigo-600 shadow-sm' : 'text-neutral-500'}"
							onclick={() => showBracket = false}
						>
							Draw View
						</button>
						<button 
							class="px-4 py-2 rounded-lg font-poppins text-sm font-semibold transition-all {showBracket ? 'bg-white text-indigo-600 shadow-sm' : 'text-neutral-500'}"
							onclick={() => showBracket = true}
						>
							Bracket View
						</button>
					</div>
				</div>

				{#if showBracket}
					<BracketVisualization 
						matches={drawResults} 
						level={activeLevel} 
						gender={activeGender}
						scores={matchScores}
					/>
				{:else}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each drawResults as match, index}
							<MatchCard {match} {index} level={activeLevel} gender={activeGender} />
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</main>
</div>

<NotificationModal isOpen={resetModal.isOpen} title={resetModal.title} message={resetModal.message} type="confirm" onConfirm={resetModal.onConfirm} onClose={() => resetModal.isOpen = false} onCancel={() => resetModal.isOpen = false} />
<NotificationModal isOpen={drawModal.isOpen} title={drawModal.title} message={drawModal.message} type="confirm" onConfirm={drawModal.onConfirm} onClose={() => drawModal.isOpen = false} onCancel={() => drawModal.isOpen = false} />

<!-- Dev Mode Modal -->
{#if devModal.isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 backdrop-blur-sm">
		<div class="bg-white rounded-2xl border border-neutral-200 p-8 max-w-md w-full mx-4 shadow-2xl">
			<h3 class="font-montserrat text-xl font-bold text-neutral-900 mb-3">{devModal.title}</h3>
			<p class="text-sm text-neutral-600 leading-relaxed mb-6">{devModal.message}</p>
			
			{#if devModal.isProcessing}
				<div class="flex items-center justify-center gap-3 py-4">
					<svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<span class="text-sm font-medium text-neutral-600">Processing...</span>
				</div>
			{:else}
				<div class="flex gap-3">
					<button
						onclick={() => devModal.isOpen = false}
						class="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-poppins font-semibold text-sm rounded-lg transition-colors"
					>
						Cancel
					</button>
					<button
						onclick={devModal.onConfirm}
						class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-poppins font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-indigo-200"
					>
						Confirm
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

{#if isModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/95 backdrop-blur-sm">
		<div class="w-full max-w-6xl px-4 flex flex-col items-center justify-center text-center">
			<h1 class="font-montserrat font-black text-5xl text-white mb-8">Yadika Cup - Basketball Drawing</h1>
			<div class="mb-8 flex items-center justify-center gap-4 flex-wrap">
				<span class="text-lg font-poppins font-semibold text-white bg-neutral-900 border border-neutral-700 rounded-full px-8 py-3">{activeLevel} {activeGender}</span>
				<span class="text-xl font-poppins font-bold text-white bg-indigo-600 border border-indigo-500 rounded-full px-10 py-3 shadow-xl shadow-indigo-500/30">DAY {shuffleDay}</span>
				<span class="text-xl font-poppins font-bold text-white bg-blue-600 border border-blue-500 rounded-full px-10 py-3 shadow-xl shadow-blue-500/30">{shuffleTime} WIB</span>
			</div>
			<h2 class="font-montserrat font-bold text-3xl mb-12 {isShuffling ? 'text-indigo-400 animate-pulse' : 'text-white'}">{#if isShuffling}Drawing Match {shuffleMatchIndex + 1}...{:else}Match {shuffleMatchIndex + 1} Confirmed!{/if}</h2>
			<div class="flex flex-col md:flex-row items-center justify-center w-full gap-12">
				<div class="w-full md:w-5/12 h-64 border-2 {isShuffling ? 'border-neutral-800 bg-white/5' : 'border-indigo-500 bg-white/10 shadow-2xl shadow-indigo-500/20'} rounded-3xl flex items-center justify-center p-6">
					<h3 class="font-poppins font-bold text-4xl {isShuffling ? 'text-neutral-700' : 'text-white'} text-center">{shuffleTeam1}</h3>
				</div>
				<div class="font-montserrat font-black text-6xl {isShuffling ? 'text-neutral-800' : 'text-indigo-400'} z-10">VS</div>
				<div class="w-full md:w-5/12 h-64 border-2 {isShuffling ? 'border-neutral-800 bg-white/5' : 'border-indigo-500 bg-white/10 shadow-2xl shadow-indigo-500/20'} rounded-3xl flex items-center justify-center p-6">
					<h3 class="font-poppins font-bold text-4xl {isShuffling ? 'text-neutral-700' : 'text-white'} text-center">{shuffleTeam2}</h3>
				</div>
			</div>
			<div class="mt-16 flex items-center justify-center gap-6">
				{#if !isShuffling}
					{#if currentMatchIndex !== -1 && teamsInput.length - drawResults.flatMap(m => [m.team1, m.team2]).filter(t => t !== '?' && t !== 'TBD').length >= 2}
						<button onclick={startActualShuffle} class="bg-indigo-600 px-8 py-4 text-sm font-poppins font-semibold text-white rounded-xl shadow-lg hover:bg-neutral-900 transition-all">Next Shuffle</button>
					{/if}
					<button onclick={() => isModalOpen = false} class="bg-neutral-900 border border-neutral-800 px-8 py-4 text-sm font-poppins font-medium text-neutral-400 rounded-xl hover:bg-neutral-800 transition-all">Back to Menu</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

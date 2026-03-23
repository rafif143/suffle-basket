<script>
	import { onMount } from 'svelte';
	import { matchService } from '$lib/services/matchService.js';
	import { scheduleService } from '$lib/services/scheduleService.js';
	import { browser } from '$app/environment';
	
	// Import gracket main export
	let Gracket = $state(null);

	let loading = $state(true);
	let lastUpdated = $state('');
	let activeTab = $state('bracket'); // 'bracket' or 'schedule'
	let selectedCategory = $state('All'); // 'All' or specific category
	let selectedLevel = $state('All'); // 'All', 'SMA', 'SMP'
	let selectedGender = $state('All'); // 'All', 'Putra', 'Putri'
	let selectedDate = $state('All'); // 'All' or specific date

	// Data
	let allMatches = $state([]);
	let matchScores = $state({});
	let filteredData = $state([]);
	let displayedData = $state([]);
	let brackets = $state({});

	onMount(async () => {
		// Only load gracket in browser
		if (browser) {
			try {
				console.log('Attempting to load gracket core library...');
				const gracketModule = await import('gracket');
				console.log('Gracket module loaded:', gracketModule);
				
				// Try different export patterns
				Gracket = gracketModule.default || gracketModule.Gracket || gracketModule;
				console.log('Gracket constructor:', Gracket);
				
				// Import CSS
				try {
					await import('gracket/style.css');
				} catch (cssError) {
					console.warn('Failed to load gracket CSS:', cssError);
				}
				
				console.log('Gracket loaded successfully');
			} catch (error) {
				console.error('Failed to load Gracket:', error);
				console.error('Error details:', error.message);
				Gracket = null;
			}
		} else {
			console.log('Not in browser, skipping gracket load');
		}
		
		loadData();
		// Auto-refresh every 30 seconds
		const interval = setInterval(loadData, 30000);
		return () => clearInterval(interval);
	});

	async function loadData() {
		try {
			loading = true;
			
			// Load all matches from new matches table
			try {
				const rawMatches = await matchService.getMatches();
				allMatches = rawMatches;
				
				// Process matches immediately
				if (rawMatches.length > 0) {
					const processed = rawMatches.map((match) => {
						// Convert category format from 'sma-putra' to 'SMA Putra'
						const categoryParts = match.category.split('-');
						if (categoryParts.length !== 2) {
							console.error('Invalid category:', match.category);
							return null;
						}
						
						const [level, gender] = categoryParts;
						const formattedCategory = `${level.toUpperCase()} ${gender.charAt(0).toUpperCase() + gender.slice(1)}`;
						
						const result = {
							...match,
							category: formattedCategory,
							level: level.toUpperCase(),
							gender: gender.charAt(0).toUpperCase() + gender.slice(1),
							date: getMatchDate(match.day),
							matchId: `${match.category.toUpperCase().replace('-', '-')}-M${String(match.match_number).padStart(2, '0')}`
						};
						
						return result;
					}).filter(match => match !== null);
					
					filteredData = processed;
					
					// Set displayedData directly instead of using $derived
					displayedData = applyFilters(processed);
					
					// Initialize brackets after data is loaded
					await initializeBrackets();
				}
			} catch (matchError) {
				console.error('Failed to load matches:', matchError);
				allMatches = [];
				filteredData = [];
			}
			
			// Load match scores
			try {
				const scoresResponse = await scheduleService.getScores();
				matchScores = scoresResponse || {};
			} catch (error) {
				console.error('Failed to load scores:', error);
				matchScores = {};
			}
			
			lastUpdated = new Date().toLocaleTimeString('id-ID');
		} catch (error) {
			console.error('Failed to load data:', error);
			allMatches = [];
			matchScores = {};
		} finally {
			loading = false;
		}
	}

	async function initializeBrackets() {
		// Wait for DOM to be ready
		await new Promise(resolve => setTimeout(resolve, 100));
		
		if (!browser || !Gracket) {
			console.warn('Gracket not available, using fallback');
			return;
		}
		
		const categories = ['SMA Putra', 'SMA Putri', 'SMP Putra', 'SMP Putri'];
		
		for (const category of categories) {
			const categoryMatches = filteredData.filter(match => match.category === category);
			if (categoryMatches.length > 0) {
				await createBracketForCategory(category, categoryMatches);
			}
		}
	}

	async function createBracketForCategory(category, matches) {
		if (!Gracket) {
			console.warn('Gracket not loaded yet');
			return;
		}
		
		try {
			// Convert matches to gracket format
			const tournamentData = convertToGracketFormat(matches);
			
			if (tournamentData.length === 0) {
				console.warn(`No tournament data for ${category}`);
				return;
			}
			
			const containerId = `#bracket-${category.toLowerCase().replace(' ', '-')}`;
			const container = document.querySelector(containerId);
			
			if (!container) {
				console.warn(`Container not found: ${containerId}`);
				return;
			}

			// Clear existing bracket
			container.innerHTML = '';
			
			// Destroy existing bracket if it exists
			if (brackets[category]) {
				try {
					brackets[category].destroy();
				} catch (e) {
					console.warn('Failed to destroy existing bracket:', e);
				}
			}
			
			// Create gracket bracket
			const bracket = new Gracket(containerId, {
				src: tournamentData,
				cornerRadius: 12,
				canvasLineColor: '#6366f1',
				canvasLineWidth: 2,
				canvasLineGap: 20,
				roundLabels: ['16 Besar', '8 Besar', 'Perempat Final', 'Semi Final', 'Final', 'Champion'],
				
				// Event callbacks for real-time updates
				onScoreUpdate: (roundIndex, gameIndex, teamIndex, score) => {
					console.log(`Score updated: Round ${roundIndex}, Game ${gameIndex}, Team ${teamIndex}, Score: ${score}`);
				},
				
				onRoundComplete: (roundIndex) => {
					console.log(`Round ${roundIndex} completed for ${category}`);
					
					// Get advancing teams if method exists
					try {
						const advancing = bracket.getAdvancingTeams(roundIndex);
						console.log('Advancing teams:', advancing.map(t => t.name));
					} catch (e) {
						console.log('getAdvancingTeams not available');
					}
				}
			});
			
			// Store bracket reference
			brackets[category] = bracket;
			
			console.log(`Bracket created for ${category} with ${tournamentData.length} rounds`);
			
		} catch (error) {
			console.error(`Failed to create bracket for ${category}:`, error);
			
			// Show fallback message in container
			const containerId = `#bracket-${category.toLowerCase().replace(' ', '-')}`;
			const container = document.querySelector(containerId);
			if (container) {
				container.innerHTML = `
					<div class="flex items-center justify-center py-12 text-center">
						<div>
							<div class="text-neutral-400 mb-2">
								<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
									<circle cx="12" cy="12" r="10"/>
									<line x1="12" y1="8" x2="12" y2="12"/>
									<line x1="12" y1="16" x2="12.01" y2="16"/>
								</svg>
							</div>
							<p class="text-neutral-500 font-medium">Failed to load bracket</p>
							<p class="text-neutral-400 text-sm">Please refresh the page</p>
						</div>
					</div>
				`;
			}
		}
	}

	function convertToGracketFormat(matches) {
		// Group matches by round
		const rounds = ['16 Besar', '8 Besar', 'Perempat Final', 'Semi Final', 'Final'];
		const tournamentData = [];
		
		rounds.forEach(roundName => {
			const roundMatches = matches.filter(match => match.round === roundName);
			
			if (roundMatches.length > 0) {
				const roundData = roundMatches.map(match => {
					const score = getMatchScore(match);
					
					const team1 = {
						name: match.team1,
						id: `${match.team1}-${match.id}`,
						seed: extractSeedFromName(match.team1),
						score: score?.score1 !== undefined ? score.score1 : undefined
					};
					
					const team2 = {
						name: match.team2,
						id: `${match.team2}-${match.id}`,
						seed: extractSeedFromName(match.team2),
						score: score?.score2 !== undefined ? score.score2 : undefined
					};
					
					return [team1, team2];
				});
				
				tournamentData.push(roundData);
			}
		});
		
		// Add champion round if final exists and has winner
		const finalRound = tournamentData[tournamentData.length - 1];
		if (finalRound && finalRound.length > 0) {
			const finalMatch = finalRound[0];
			if (finalMatch[0].score !== undefined && finalMatch[1].score !== undefined) {
				const winner = finalMatch[0].score > finalMatch[1].score ? finalMatch[0] : finalMatch[1];
				tournamentData.push([[winner]]);
			}
		}
		
		return tournamentData;
	}

	function extractSeedFromName(teamName) {
		// Try to extract seed from team name or use a default
		// For now, just use a simple numbering system
		const hash = teamName.split('').reduce((a, b) => {
			a = ((a << 5) - a) + b.charCodeAt(0);
			return a & a;
		}, 0);
		return Math.abs(hash % 16) + 1;
	}

	function getRoundName(round) {
		const roundMap = {
			'16 Besar': '16 Besar',
			'8 Besar': '8 Besar', 
			'Perempat Final': 'Perempat Final',
			'Semi Final': 'Semi Final',
			'Final': 'Final'
		};
		return roundMap[round] || round;
	}

	function applyFilters(matches) {
		if (!matches || matches.length === 0) {
			return [];
		}

		let filtered = matches;

		// Apply category filter (takes precedence over level/gender)
		if (selectedCategory !== 'All') {
			filtered = filtered.filter(match => match.category === selectedCategory);
		} else {
			// Apply level filter (SMA/SMP) only if no specific category selected
			if (selectedLevel !== 'All') {
				filtered = filtered.filter(match => match.level === selectedLevel);
			}

			// Apply gender filter (Putra/Putri) only if no specific category selected
			if (selectedGender !== 'All') {
				filtered = filtered.filter(match => match.gender === selectedGender);
			}
		}

		// Apply date filter
		if (selectedDate !== 'All') {
			filtered = filtered.filter(match => match.date === selectedDate);
		}

		// Sort by category and round for better display
		filtered.sort((a, b) => {
			// First sort by category
			if (a.category !== b.category) {
				return a.category.localeCompare(b.category);
			}
			// Then by round order
			const roundOrder = ['16 Besar', '8 Besar', 'Perempat Final', 'Semi Final', 'Final'];
			const aRoundIndex = roundOrder.indexOf(a.round);
			const bRoundIndex = roundOrder.indexOf(b.round);
			if (aRoundIndex !== bRoundIndex) {
				return aRoundIndex - bRoundIndex;
			}
			// Finally by match number
			return a.match_number - b.match_number;
		});

		return filtered;
	}

	// Update displayedData when filters change
	$effect(() => {
		if (filteredData.length > 0) {
			displayedData = applyFilters(filteredData);
			// Reinitialize brackets when filters change
			if (activeTab === 'bracket') {
				initializeBrackets();
			}
		}
	});

	function getMatchDate(day) {
		try {
			const startDate = new Date('2026-03-24'); // Tournament start date
			const matchDate = new Date(startDate);
			matchDate.setDate(startDate.getDate() + day - 1);
			return matchDate.toLocaleDateString('id-ID', { 
				weekday: 'long', 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric' 
			});
		} catch (error) {
			return `Day ${day}`;
		}
	}

	// Available dates
	let availableDates = $derived(() => {
		const dates = [...new Set(allMatches.map(match => getMatchDate(match.day)))];
		return dates.sort();
	});

	function getMatchScore(match) {
		// Convert category back to original format for score key
		const originalCategory = match.category.toLowerCase().replace(' ', '-');
		const scoreKey = `${match.day}-M${String(match.match_number).padStart(2, '0')}-${originalCategory}`;
		
		const score = matchScores[scoreKey];
		return score || null;
	}

	function isMatchComplete(match) {
		// Check if match status is Complete AND we have score data
		if (match.status !== 'Complete') {
			return false;
		}
		
		const score = getMatchScore(match);
		return score && score.score1 !== undefined && score.score2 !== undefined;
	}

	function getWinner(match) {
		const score = getMatchScore(match);
		if (!score) return null;
		if (score.score1 > score.score2) return match.team1;
		if (score.score2 > score.score1) return match.team2;
		return 'Draw';
	}

	function getBracketStructure(categoryMatches) {
		const rounds = ['16 Besar', '8 Besar', 'Perempat Final', 'Semi Final', 'Final'];
		const bracket = {};
		
		rounds.forEach(round => {
			bracket[round] = categoryMatches.filter(match => match.round === round);
		});
		
		return bracket;
	}
</script>

<style>
	.gracket-container {
		min-height: 500px;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 1.5rem;
		scroll-behavior: smooth;
		/* Custom scrollbar */
		scrollbar-width: thin;
		scrollbar-color: #6366f1 #f1f5f9;
	}
	
	.gracket-container::-webkit-scrollbar {
		height: 8px;
	}
	
	.gracket-container::-webkit-scrollbar-track {
		background: #f1f5f9;
		border-radius: 4px;
	}
	
	.gracket-container::-webkit-scrollbar-thumb {
		background: #6366f1;
		border-radius: 4px;
	}
	
	.gracket-container::-webkit-scrollbar-thumb:hover {
		background: #4f46e5;
	}
	
	/* Simple fallback bracket styles */
	.simple-bracket {
		display: flex;
		gap: 3rem;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 1rem;
		min-height: 500px;
		scroll-behavior: smooth;
		/* Custom scrollbar */
		scrollbar-width: thin;
		scrollbar-color: #6366f1 #f1f5f9;
	}
	
	.simple-bracket::-webkit-scrollbar {
		height: 8px;
	}
	
	.simple-bracket::-webkit-scrollbar-track {
		background: #f1f5f9;
		border-radius: 4px;
	}
	
	.simple-bracket::-webkit-scrollbar-thumb {
		background: #6366f1;
		border-radius: 4px;
	}
	
	.simple-bracket::-webkit-scrollbar-thumb:hover {
		background: #4f46e5;
	}
	
	.round-section {
		display: flex;
		flex-direction: column;
		min-width: 280px;
		flex-shrink: 0;
		position: relative;
	}
	
	.round-title {
		font-family: 'Montserrat', sans-serif;
		font-weight: 700;
		font-size: 0.875rem;
		color: white;
		margin-bottom: 1.5rem;
		text-align: center;
		padding: 0.75rem;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		border-radius: 0.75rem;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
		position: sticky;
		top: 0;
		z-index: 10;
	}
	
	.matches {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		flex: 1;
		justify-content: space-evenly;
		align-items: center;
		padding: 1rem 0;
	}
	
	.match-card {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 1rem;
		padding: 1.25rem;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		width: 240px;
		position: relative;
	}
	
	.match-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 32px rgba(99, 102, 241, 0.15);
		border-color: #6366f1;
	}
	
	.match-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #6366f1, #8b5cf6);
		border-radius: 1rem 1rem 0 0;
	}
	
	.teams {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.team {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
	}
	
	.team.winner {
		background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
		border: 2px solid #16a34a;
		transform: scale(1.02);
	}
	
	.team .name {
		font-family: 'Montserrat', sans-serif;
		font-weight: 600;
		font-size: 0.875rem;
		color: #111827;
		flex: 1;
		margin-right: 0.75rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.team.winner .name {
		color: #166534;
		font-weight: 700;
	}
	
	.team .score {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 1.25rem;
		color: #6366f1;
		min-width: 2.5rem;
		text-align: center;
		padding: 0.25rem 0.5rem;
		background: white;
		border-radius: 0.375rem;
		border: 1px solid #e2e8f0;
	}
	
	.team.winner .score {
		color: #16a34a;
		background: white;
		border-color: #16a34a;
		box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1);
	}
	
	.vs {
		text-align: center;
		font-size: 0.75rem;
		font-weight: 700;
		color: #6366f1;
		margin: 0.5rem 0;
		padding: 0.25rem;
		background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
		border-radius: 0.375rem;
		letter-spacing: 0.5px;
	}
	
	/* Custom styling for gracket brackets */
	:global(.g_gracket) {
		font-family: 'Poppins', sans-serif;
	}
	
	:global(.g_team) {
		background: linear-gradient(90deg, #ffffff 0%, #f8f9fa 100%);
		border-left: 4px solid #6366f1;
		color: #111827;
		font-weight: 600;
		padding: 12px 16px;
		margin: 2px 0;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	}
	
	:global(.g_team:hover) {
		transform: translateX(4px);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
		border-left-color: #4f46e5;
	}
	
	:global(.g_winner .g_team) {
		background: linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%);
		border-left-color: #16a34a;
		color: #166534;
		font-weight: 700;
	}
	
	:global(.g_winner .g_team:hover) {
		border-left-color: #15803d;
		box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
	}
	
	:global(.g_round_label) {
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		font-family: 'Montserrat', sans-serif;
		font-weight: 700;
		font-size: 0.875rem;
		padding: 8px 16px;
		border-radius: 6px;
		text-align: center;
		margin-bottom: 1rem;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
	}
	
	:global(.g_game) {
		margin: 8px 0;
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		background: white;
	}
	
	:global(.g_game:hover) {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
	}
	
	/* Score styling */
	:global(.g_team .score) {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 1.25rem;
		color: #6366f1;
		margin-left: auto;
		padding-left: 1rem;
	}
	
	:global(.g_winner .g_team .score) {
		color: #16a34a;
	}
	
	/* Canvas line customization */
	:global(.g_gracket canvas) {
		z-index: 1;
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.gracket-container, .simple-bracket {
			padding: 1rem 0.5rem;
			min-height: 400px;
		}
		
		.simple-bracket {
			gap: 2rem;
		}
		
		.round-section {
			min-width: 260px;
		}
		
		.match-card {
			width: 220px;
			padding: 1rem;
		}
		
		.round-title {
			font-size: 0.75rem;
			padding: 0.5rem;
			margin-bottom: 1rem;
		}
		
		.team .name {
			font-size: 0.8rem;
		}
		
		.team .score {
			font-size: 1.1rem;
			min-width: 2rem;
		}
		
		:global(.g_team) {
			padding: 10px 12px;
			font-size: 0.875rem;
		}
		
		:global(.g_round_label) {
			font-size: 0.75rem;
			padding: 6px 12px;
		}
	}
	
	@media (max-width: 480px) {
		.simple-bracket {
			gap: 1.5rem;
		}
		
		.round-section {
			min-width: 240px;
		}
		
		.match-card {
			width: 200px;
			padding: 0.875rem;
		}
		
		.matches {
			gap: 1.5rem;
		}
	}
</style>

<svelte:head>
	<title>Live Scores | Yadika Cup</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-neutral-50 via-white to-neutral-50/50">
	<!-- Header -->
	<header class="bg-white/90 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
		<div class="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
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
				<!-- Refresh Button -->
				<button 
					onclick={loadData}
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

	<!-- Filters and Tabs -->
	<div class="bg-white border-b border-neutral-200 px-6 py-4">
		<!-- Tabs -->
		<div class="flex items-center justify-between mb-4">
			<div class="flex bg-neutral-100 rounded-xl p-0.5 gap-0.5">
				<button 
					class="px-4 py-2 rounded-lg font-poppins text-sm font-semibold transition-all {activeTab === 'bracket' ? 'bg-white text-indigo-600 shadow-sm' : 'text-neutral-500'}"
					onclick={() => activeTab = 'bracket'}
				>
					Bracket
				</button>
				<button 
					class="px-4 py-2 rounded-lg font-poppins text-sm font-semibold transition-all {activeTab === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-neutral-500'}"
					onclick={() => activeTab = 'schedule'}
				>
					Schedule
				</button>
			</div>
		</div>

		<!-- Filters -->
		<div class="flex flex-wrap items-center gap-3">
			<!-- Category Filter (Quick Select) -->
			<div class="flex items-center gap-2">
				<label for="category-filter" class="text-sm font-poppins font-medium text-neutral-700">Category:</label>
				<select id="category-filter" bind:value={selectedCategory} class="px-3 py-2 bg-white border border-neutral-200 rounded-lg font-poppins text-sm text-neutral-700 outline-none cursor-pointer">
					<option value="All">All Categories</option>
					<option value="SMA Putra">SMA Putra</option>
					<option value="SMA Putri">SMA Putri</option>
					<option value="SMP Putra">SMP Putra</option>
					<option value="SMP Putri">SMP Putri</option>
				</select>
			</div>

			<!-- Level Filter -->
			<div class="flex items-center gap-2">
				<label for="level-filter" class="text-sm font-poppins font-medium text-neutral-700">Level:</label>
				<select id="level-filter" bind:value={selectedLevel} class="px-3 py-2 bg-white border border-neutral-200 rounded-lg font-poppins text-sm text-neutral-700 outline-none cursor-pointer">
					<option value="All">All</option>
					<option value="SMA">SMA</option>
					<option value="SMP">SMP</option>
				</select>
			</div>

			<!-- Gender Filter -->
			<div class="flex items-center gap-2">
				<label for="gender-filter" class="text-sm font-poppins font-medium text-neutral-700">Gender:</label>
				<select id="gender-filter" bind:value={selectedGender} class="px-3 py-2 bg-white border border-neutral-200 rounded-lg font-poppins text-sm text-neutral-700 outline-none cursor-pointer">
					<option value="All">All</option>
					<option value="Putra">Putra</option>
					<option value="Putri">Putri</option>
				</select>
			</div>

			<!-- Date Filter -->
			<div class="flex items-center gap-2">
				<label for="date-filter" class="text-sm font-poppins font-medium text-neutral-700">Date:</label>
				<select id="date-filter" bind:value={selectedDate} class="px-3 py-2 bg-white border border-neutral-200 rounded-lg font-poppins text-sm text-neutral-700 outline-none cursor-pointer">
					<option value="All">All Dates</option>
					{#each availableDates as date}
						<option value={date}>{date}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

		<!-- Content -->
	<main class="p-6">
		
		{#if loading && allMatches.length === 0}
			<div class="flex items-center justify-center py-20">
				<div class="text-center">
					<div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p class="text-neutral-600 font-poppins">Loading live scores...</p>
				</div>
			</div>
		{:else if displayedData.length === 0}
			<div class="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
				<div class="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400">
						<circle cx="12" cy="12" r="10"/>
						<line x1="12" y1="8" x2="12" y2="12"/>
						<line x1="12" y1="16" x2="12.01" y2="16"/>
					</svg>
				</div>
				<h3 class="font-montserrat text-lg font-bold text-neutral-500 mb-2">No Matches Found</h3>
				<p class="text-neutral-400 text-sm">No matches available for the selected filters.</p>
			</div>
		{:else}
			{#if activeTab === 'bracket'}
				<!-- Gracket.js Bracket View -->
				<div class="space-y-8">
					{#each ['SMA Putra', 'SMA Putri', 'SMP Putra', 'SMP Putri'] as category}
						{@const categoryMatches = displayedData.filter(match => match.category === category)}
						{#if categoryMatches.length > 0}
							<div class="bg-white rounded-xl border border-neutral-200 overflow-hidden">
								<div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
									<h3 class="font-montserrat text-xl font-bold text-white">{category}</h3>
									<p class="text-indigo-100 text-sm mt-1">
										{categoryMatches.length} matches • {categoryMatches.filter(m => isMatchComplete(m)).length} completed
									</p>
								</div>
								<div class="p-6 relative">
									<!-- Scroll Indicator -->
									<div class="absolute top-2 right-2 text-xs text-neutral-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-neutral-200">
										<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1">
											<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
										</svg>
										Scroll to view
									</div>
									{#if Gracket}
										<!-- Gracket Bracket Container -->
										<div 
											id="bracket-{category.toLowerCase().replace(' ', '-')}" 
											class="gracket-container"
										></div>
									{:else}
										<!-- Simple Fallback Bracket -->
										{@const bracket = getBracketStructure(categoryMatches)}
										<div class="simple-bracket">
											{#each ['16 Besar', 'Perempat Final', 'Semi Final', 'Final', 'Final'] as round}
												{#if bracket[round] && bracket[round].length > 0}
													<div class="round-section">
														<h4 class="round-title">{round}</h4>
														<div class="matches">
															{#each bracket[round] as match}
																<div class="match-card">
																	<div class="teams">
																		<div class="team {getWinner(match) === match.team1 ? 'winner' : ''}">
																			<span class="name">{match.team1}</span>
																			{#if isMatchComplete(match)}
																				{@const score = getMatchScore(match)}
																				<span class="score">{score?.score1 || '-'}</span>
																			{:else}
																				<span class="score">-</span>
																			{/if}
																		</div>
																		<div class="vs">VS</div>
																		<div class="team {getWinner(match) === match.team2 ? 'winner' : ''}">
																			<span class="name">{match.team2}</span>
																			{#if isMatchComplete(match)}
																				{@const score = getMatchScore(match)}
																				<span class="score">{score?.score2 || '-'}</span>
																			{:else}
																				<span class="score">-</span>
																			{/if}
																		</div>
																	</div>
																</div>
															{/each}
														</div>
													</div>
												{/if}
											{/each}
										</div>
									{/if}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<!-- Schedule View - Simple List -->
				<div class="space-y-6">
					{#each availableDates as date}
						{@const dayMatches = displayedData.filter(match => match.date === date)}
						{#if dayMatches.length > 0}
							<div class="bg-white rounded-xl border border-neutral-200 overflow-hidden">
								<div class="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
									<h3 class="font-montserrat text-lg font-bold text-neutral-900">{date}</h3>
								</div>
								<div class="p-6">
									<div class="space-y-4">
										{#each dayMatches as match}
											<div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
												<div class="flex items-center gap-4">
													<div class="text-center">
														<div class="text-sm font-poppins font-bold text-neutral-900">{match.match_time}</div>
														<div class="text-xs text-neutral-500">WIB</div>
													</div>
													<div class="w-px h-12 bg-neutral-200"></div>
													<div>
														<div class="text-sm font-poppins font-bold text-neutral-900">{match.category}</div>
														<div class="text-xs text-neutral-500">{getRoundName(match.round)} - M{String(match.match_number).padStart(2, '0')}</div>
													</div>
												</div>
												<div class="text-right">
													<div class="text-sm font-montserrat font-bold text-neutral-900">
														{match.team1} vs {match.team2}
													</div>
													{#if isMatchComplete(match)}
														{@const score = getMatchScore(match)}
														{#if score && score.score1 !== undefined && score.score2 !== undefined}
															<div class="text-xs text-indigo-600 font-semibold">
																{score.score1} - {score.score2}
															</div>
														{:else}
															<div class="text-xs text-neutral-500">Score not available</div>
														{/if}
													{:else}
														<div class="text-xs text-neutral-500">Not started</div>
													{/if}
												</div>
											</div>
										{/each}
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		{/if}
	</main>
</div>
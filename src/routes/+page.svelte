<script>
	import { jsPDF } from "jspdf";
	import autoTable from "jspdf-autotable";
	import NotificationModal from "$lib/NotificationModal.svelte";
	// Categories
	// Categories
	let activeLevel = $state('SMA');
	let activeGender = $state('Putra');
	let activeCategory = $derived(`${activeLevel.toLowerCase()}-${activeGender.toLowerCase()}`);

	const dummyData = {
		'sma-putra': ['SMAN 1 Jakarta', 'SMAN 3 Jakarta', 'SMAN 8 Jakarta', 'SMA Labschool', 'SMA BPK Penabur', 'SMAN 70 Jakarta', 'SMAN 28 Jakarta', 'SMA Gonzaga', 'SMAN 6 Jakarta', 'SMA Al-Izhar', 'SMAN 71 Jakarta', 'SMA Kanisius', 'SMAN 61 Jakarta', 'SMA Pangudi Luhur', 'SMAN 34 Jakarta', 'SMA Pelita Harapan'],
		'sma-putri': ['SMAN 1 Jakarta (Pi)', 'SMAN 3 Jakarta (Pi)', 'SMAN 8 Jakarta (Pi)', 'SMA Labschool (Pi)', 'SMA BPK Penabur (Pi)', 'SMAN 70 Jakarta (Pi)', 'SMAN 28 Jakarta (Pi)', 'SMA Gonzaga (Pi)', 'SMAN 6 Jakarta (Pi)', 'SMA Al-Izhar (Pi)', 'SMAN 71 Jakarta (Pi)', 'SMA Santa Ursula', 'SMAN 61 Jakarta (Pi)', 'SMA Tarakanita 1', 'SMAN 34 Jakarta (Pi)', 'SMA Pelita Harapan (Pi)'],
		'smp-putra': ['SMPN 115 Jakarta', 'SMPN 19 Jakarta', 'SMP Labschool', 'SMP BPK Penabur', 'SMPN 255 Jakarta', 'SMPN 111 Jakarta', 'SMP Al-Azhar', 'SMP Kanisius', 'SMPN 49 Jakarta', 'SMPN 216 Jakarta', 'SMP Pangudi Luhur', 'SMPN 99 Jakarta', 'SMPN 85 Jakarta', 'SMP Gonzaga', 'SMPN 109 Jakarta', 'SMP Pelita Harapan'],
		'smp-putri': ['SMPN 115 Jkt (Pi)', 'SMPN 19 Jkt (Pi)', 'SMP Labschool (Pi)', 'SMP BPK Penabur (Pi)', 'SMPN 255 Jkt (Pi)', 'SMPN 111 Jkt (Pi)', 'SMP Al-Azhar (Pi)', 'SMP Santa Ursula', 'SMPN 49 Jkt (Pi)', 'SMPN 216 Jkt (Pi)', 'SMP Tarakanita', 'SMPN 99 Jkt (Pi)', 'SMPN 85 Jkt (Pi)', 'SMP Gonzaga (Pi)', 'SMPN 109 Jkt (Pi)', 'SMP Pelita Harapan (Pi)']
	};

	// Per-category state (using local storage mock)
	let teamsInput = $state([]);
	let newTeamName = $state('');
	let drawResults = $state(Array(8).fill({ team1: '?', team2: '?' }));
	let isShuffling = $state(false);
	let isModalOpen = $state(false);
	let isBracketFullscreen = $state(false);
	let shuffleTeam1 = $state('???');
	let shuffleTeam2 = $state('???');
	let shuffleMatchIndex = $state(-1);
	
	// Reset Confirmation Modal State
	let resetModal = $state({
		isOpen: false,
		title: 'Reset Draw',
		message: 'Are you sure you want to reset all draw results for this category?',
		onConfirm: () => {
			drawResults = Array(8).fill(null).map(() => ({ team1: '?', team2: '?' }));
			saveToLocalStorage();
			resetModal.isOpen = false;
		}
	});

	// Draw Confirmation Modal State
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

	function getMatchDay(level, gender, matchIndex) {
		if (matchIndex < 0) return '';
		const baseDays = level === 'SMA' ? [1, 3, 5] : [2, 4, 6];
		
		// Adjusting for Day 5 and 6 which can have up to 6 matches
		const day5or6 = baseDays[2];
		const isDay5or6 = day5or6 === 5 || day5or6 === 6;

		if (gender === 'Putra') {
			if (matchIndex < 3) return baseDays[0];
			if (matchIndex < 5) return baseDays[1];
			return baseDays[2];
		} else {
			if (matchIndex < 2) return baseDays[0];
			if (matchIndex < 5) return baseDays[1];
			return baseDays[2];
		}
	}

	function getMatchTime(day, matchIndexInDay) {
		const standardTimes = [
			'15.30 - 16.30',
			'16.30 - 17.30',
			'17.45 - 18.45',
			'18.45 - 19.45',
			'19.45 - 20.45'
		];
		
		const day5or6Times = [
			'14.30 - 15.30', // minus 1 hour from start
			'15.30 - 16.30',
			'16.30 - 17.30',
			'17.45 - 18.45',
			'18.45 - 19.45',
			'19.45 - 20.45'
		];

		const day7PlusTimes = [
			'15.30 - 16.30', // set 4 set 5
			'16.30 - 17.30', // set 5 set 6
			'19.00 - 20.00', // jam 7 - 8
			'20.00 - 21.00'  // jam 8 - 9
		];

		const times = day >= 7 ? day7PlusTimes : (day === 5 || day === 6) ? day5or6Times : standardTimes;
		return times[matchIndexInDay] || 'TBD';
	}
	
	function getMatchIndexInDay(level, gender, matchIndex) {
		const day = getMatchDay(level, gender, matchIndex);
		// Count how many matches before this one have the same day
		let count = 0;
		for (let i = 0; i < matchIndex; i++) {
			if (getMatchDay(level, gender, i) === day) {
				count++;
			}
		}
		return count;
	}

	let shuffleDay = $derived(getMatchDay(activeLevel, activeGender, shuffleMatchIndex));
	let shuffleTime = $derived(getMatchTime(shuffleDay, getMatchIndexInDay(activeLevel, activeGender, shuffleMatchIndex)));

	$effect(() => {
		// When activeCategory changes, we fetch data from localStorage
		const savedInput = localStorage.getItem(`teams_${activeCategory}`);
		if (savedInput) {
			teamsInput = JSON.parse(savedInput);
		} else {
			// Start empty
			teamsInput = [];
		}

		const savedResults = localStorage.getItem(`results_${activeCategory}`);
		if (savedResults) {
			drawResults = JSON.parse(savedResults);
		} else {
			drawResults = Array(8)
				.fill(null)
				.map(() => ({ team1: '?', team2: '?' }));
		}
	});

	function saveToLocalStorage() {
		localStorage.setItem(`teams_${activeCategory}`, JSON.stringify(teamsInput));
		localStorage.setItem(`results_${activeCategory}`, JSON.stringify(drawResults));
	}

	function addTeam(e) {
		if (e) e.preventDefault();
		const t = newTeamName.trim();
		if (t && teamsInput.length < 16) {
			teamsInput = [...teamsInput, t];
			newTeamName = '';
			saveToLocalStorage();
		}
	}

	function removeTeam(index) {
		teamsInput = teamsInput.filter((_, i) => i !== index);
		saveToLocalStorage();
	}

	function handleShuffle() {
		if (isShuffling) return;
		const nextIdx = drawResults.findIndex(m => m.team1 === '?' || m.team2 === '?');
		if (nextIdx === -1) return;

		drawModal.message = `Ready to draw teams for Match 0${nextIdx + 1}? This will select two teams at random from the remaining pool.`;
		drawModal.isOpen = true;
	}

	function startActualShuffle() {
		if (isShuffling) return;

		// Find teams that haven't been drawn yet
		const drawnTeams = drawResults.flatMap(m => [m.team1, m.team2]).filter(t => t !== '?' && t !== 'TBD');
		const remainingTeams = teamsInput.filter(t => !drawnTeams.includes(t));

		if (remainingTeams.length < 2) return;
		if (currentMatchIndex === -1) return; // All matches drawn

		isShuffling = true;
		isModalOpen = true;
		shuffleMatchIndex = currentMatchIndex;
		shuffleTeam1 = '';
		shuffleTeam2 = '';

		let counter = 0;
		const duration = 2500; // 2.5 seconds of dramatic shuffling
		const interval = 80;

		const timer = setInterval(() => {
			counter += interval;
			// pick random from remaining Teams
			shuffleTeam1 = remainingTeams[Math.floor(Math.random() * remainingTeams.length)];
			shuffleTeam2 = remainingTeams[Math.floor(Math.random() * remainingTeams.length)];

			if (counter >= duration) {
				clearInterval(timer);
				
				let shuffled = [...remainingTeams].sort(() => 0.5 - Math.random());
				shuffleTeam1 = shuffled[0];
				shuffleTeam2 = shuffled[1];

				// Fill the next match
				drawResults[shuffleMatchIndex] = { team1: shuffleTeam1, team2: shuffleTeam2 };
				drawResults = [...drawResults];
				
				saveToLocalStorage();
				isShuffling = false;
			}
		}, interval);
	}

	function closeModal() {
		isModalOpen = false;
	}

	function nextShuffle() {
		// No modal for sequential shuffles, just start
		startActualShuffle();
	}

	function resetDraw() {
		resetModal.isOpen = true;
	}

	function generatePDF(all = false) {
		const doc = new jsPDF();
		const categories = all ? ['sma-putra', 'sma-putri', 'smp-putra', 'smp-putri'] : [activeCategory];
		const title = all ? "Full Tournament Match Schedule" : `Tournament Schedule - ${activeLevel} ${activeGender}`;
		
		doc.setFontSize(20);
		doc.text("TOURNAMENT DRAW RESULTS", 105, 15, { align: "center" });
		doc.setFontSize(14);
		doc.text(title, 105, 25, { align: "center" });
		doc.setFontSize(10);
		doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 32, { align: "center" });

		let startY = 40;

		categories.forEach((cat) => {
			const catResults = all ? JSON.parse(localStorage.getItem(`results_${cat}`) || '[]') : drawResults;
			if (!catResults || catResults.length === 0 || catResults.every(r => r.team1 === '?')) return;

			const parts = cat.split('-');
			const currentLevel = parts[0].toUpperCase();
			const currentGender = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);

			doc.setFontSize(14);
			doc.text(`${currentLevel} ${currentGender}`, 14, startY);
			startY += 5;

			const tableData = catResults.map((r, i) => {
				const day = getMatchDay(currentLevel, currentGender, i);
				const time = getMatchTime(day, getMatchIndexInDay(currentLevel, currentGender, i));
				return [
					`M0${i + 1}`,
					`Day ${day}`,
					time,
					r.team1 === '?' ? 'TBD' : r.team1,
					'VS',
					r.team2 === '?' ? 'TBD' : r.team2
				];
			});

			autoTable(doc, {
				startY: startY,
				head: [['Match', 'Day', 'Time', 'Team 1', '', 'Team 2']],
				body: tableData,
				theme: 'striped',
				headStyles: { fillColor: [79, 70, 229], textColor: 255 },
				styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
				columnStyles: {
					0: { cellWidth: 20 },
					1: { cellWidth: 20 },
					2: { cellWidth: 35 },
					3: { cellWidth: 'auto', fontStyle: 'bold' },
					4: { cellWidth: 15, halign: 'center', textColor: [150, 150, 150] },
					5: { cellWidth: 'auto', fontStyle: 'bold' }
				}
			});

			startY = doc.lastAutoTable.finalY + 15;
			if (startY > 250 && categories.length > 1) {
				doc.addPage();
				startY = 20;
			}
		});

		doc.save(`Draw_Results_${all ? 'Full' : activeCategory}.pdf`);
	}

	function loadDummy() {
		if (teamsInput.length > 0 && !confirm('Override current teams with dummy data?')) return;
		teamsInput = [...dummyData[activeCategory]];
		saveToLocalStorage();
	}
</script>

<div class="selection:bg-indigo-500 font-poppins min-h-screen bg-neutral-50 text-neutral-900 selection:text-white">
	<!-- Navbar -->
	<header class="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
		<div class="container mx-auto flex flex-col items-center justify-between gap-4 p-4 md:flex-row">
			<div class="flex items-center space-x-3">
				<div
					class="bg-indigo-600 flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_4px_10px_rgba(79,70,229,0.3)]"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="white"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-dices"
						><rect width="12" height="12" x="2" y="10" rx="2" ry="2" /><path
							d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"
						/><path d="M6 18h.01" /><path d="M10 14h.01" /><path d="M15 6h.01" /><path
							d="M18 9h.01"
						/></svg
					>
				</div>
				<div>
					<h1
						class="font-poppins font-black text-3xl leading-none tracking-wider text-neutral-900 uppercase md:text-4xl"
					>
						Championship <span class="text-indigo-600">Draw</span>
					</h1>
					<p class="text-sm font-bold text-neutral-500 uppercase tracking-widest">
						Tournament Bracket Generator
					</p>
				</div>
			</div>

			<!-- Tabs -->
			<div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
				<div class="flex gap-2 w-full md:w-auto">
					<a href="/management" class="flex-1 md:flex-none px-5 py-2.5 bg-neutral-100 border border-neutral-200 hover:border-indigo-500/50 text-indigo-600 font-bold rounded-xl transition-all text-center uppercase tracking-widest text-sm flex items-center justify-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
						Management
					</a>
					<a href="/registration" class="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-center uppercase tracking-widest text-sm shadow-[0_4px_10px_rgba(79,70,229,0.2)]">
						Register Team
					</a>
				</div>
				
				<div class="flex gap-3 w-full md:w-auto">
					<!-- Level Toggle -->
					<nav class="flex space-x-1 rounded-xl border border-neutral-200 bg-neutral-100 p-1 flex-1 md:flex-none">
						{#each ['SMA', 'SMP'] as lvl}
							<button
								class="flex-1 md:flex-none rounded-lg px-6 py-2 text-base font-bold uppercase transition-all duration-300 {activeLevel === lvl
									? 'bg-white text-indigo-600 shadow-sm border border-neutral-200'
									: 'text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900'}"
								onclick={() => (activeLevel = lvl)}
							>
								{lvl}
							</button>
						{/each}
					</nav>

					<!-- Gender Toggle -->
					<nav class="flex space-x-1 rounded-xl border border-neutral-200 bg-neutral-100 p-1 flex-1 md:flex-none">
						{#each ['Putra', 'Putri'] as gen}
							<button
								class="flex-1 md:flex-none rounded-lg px-6 py-2 text-base font-bold uppercase transition-all duration-300 {activeGender === gen
									? 'bg-white text-indigo-600 shadow-sm border border-neutral-200'
									: 'text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900'}"
								onclick={() => (activeGender = gen)}
							>
								{gen}
							</button>
						{/each}
					</nav>
				</div>
			</div>
		</div>
	</header>

	<main class="container mx-auto p-4 md:p-6 lg:p-8">
		<!-- Main Content Grid -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
			<!-- Left side: Entry -->
			<div class="col-span-1 space-y-4 lg:col-span-4">
				<div
					class="group relative h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl backdrop-blur-xl"
				>
					<h2
						class="relative z-10 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xl font-bold tracking-widest text-neutral-900 uppercase"
					>
						<div class="flex items-center gap-3">
							<span class="font-poppins font-black">Participants</span>
							<span
								class="text-indigo-600 border-indigo-200 rounded border bg-indigo-50 px-2 py-1 text-xs font-bold shadow-sm"
								>16 Teams</span
							>
						</div>
						<button 
							onclick={loadDummy}
							class="text-[10px] uppercase font-bold px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded border border-neutral-200 transition-colors flex items-center justify-center gap-2 tracking-wider"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
							Load Dummies
						</button>
					</h2>
					<p class="relative z-10 mb-4 text-xs font-medium leading-relaxed text-neutral-500 uppercase tracking-widest">
						Enter the 16 teams participating in <strong class="text-neutral-900"
							>{activeLevel} {activeGender}</strong
						>.
					</p>

					<div class="relative z-10">
						<form onsubmit={addTeam} class="mb-4 flex gap-2">
							<input
								type="text"
								bind:value={newTeamName}
								disabled={teamsInput.length >= 16}
								class="focus:ring-indigo-500/50 focus:border-indigo-500 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-bold text-neutral-900 shadow-sm transition-all placeholder:text-neutral-400 focus:outline-none focus:ring-2 disabled:opacity-50"
								placeholder="Enter team name..."
							/>
							<button
								type="submit"
								disabled={teamsInput.length >= 16 || newTeamName.trim() === ''}
								class="bg-indigo-600 rounded-xl px-6 py-3 font-black text-white text-sm uppercase tracking-widest transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
							>
								ADD
							</button>
						</form>

						<div class="scrollbar-thin scrollbar-thumb-neutral-200 h-[520px] space-y-2 overflow-y-auto pr-2 pb-10">
							<div class="mb-2 text-right">
								<span class="{teamsInput.length === 16 ? 'text-indigo-600 font-bold' : 'text-neutral-400'} text-sm font-bold uppercase tracking-widest">{teamsInput.length}/16 Teams Added</span>
							</div>
							{#each teamsInput as team, i}
								{@const isScheduled = drawResults.some(m => m.team1 === team || m.team2 === team)}
								<div class="flex items-center justify-between rounded-lg border {isScheduled ? 'border-indigo-100 bg-indigo-50/50' : 'border-neutral-100 bg-neutral-50'} p-3 transition-colors hover:border-neutral-200">
									<div class="flex items-center gap-3 overflow-hidden">
										<span class="font-poppins font-black text-neutral-400 text-lg">{i + 1}</span>
										<div class="flex flex-col">
											<span class="font-bold text-neutral-900 text-base leading-tight">{team}</span>
											{#if isScheduled}
												<span class="text-xs font-black text-indigo-600 uppercase tracking-widest mt-0.5 flex items-center gap-1">
													<span class="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
													Scheduled
												</span>
											{:else}
												<span class="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Not Scheduled</span>
											{/if}
										</div>
									</div>
									<button
										onclick={() => removeTeam(i)}
										class="text-neutral-300 transition-colors hover:text-red-500 shrink-0"
										aria-label="Remove Team"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
									</button>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Center/Right Side: The Draw UI & Results -->
			<div class="col-span-1 flex flex-col gap-6 lg:col-span-8">
				<!-- Action Banner -->
				<div
					class="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl sm:flex-row"
				>
					<div class="relative z-10 text-center sm:text-left">
						<h3 class="font-poppins font-black mb-1 text-3xl tracking-widest text-neutral-900">
							{#if currentMatchIndex === -1}
								Draw Complete!
							{:else}
								Execute Draw: Match 0{currentMatchIndex + 1}
							{/if}
						</h3>
						<p class="text-sm font-bold uppercase tracking-widest text-neutral-400">
							{#if currentMatchIndex === -1}
								All matches have been generated successfully.
							{:else}
								Shuffle the remaining teams dynamically to generate the next match.
							{/if}
						</p>
					</div>

					{#if currentMatchIndex === -1 && drawResults.some(r => r.team1 !== '?')}
						<div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
							<div class="flex items-center bg-indigo-50 border border-indigo-100 rounded-xl px-2 py-1 shadow-sm">
								<button
									onclick={() => generatePDF(false)}
									class="flex items-center gap-2 px-4 py-3 text-sm font-black tracking-widest text-indigo-600 uppercase hover:bg-white hover:shadow-sm rounded-lg transition-all"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 0 0 1-2 2H5a2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
									PDF (Category)
								</button>
								<div class="w-px h-6 bg-indigo-200 mx-1"></div>
								<button
									onclick={() => generatePDF(true)}
									class="flex items-center gap-2 px-4 py-3 text-sm font-black tracking-widest text-indigo-600 uppercase hover:bg-white hover:shadow-sm rounded-lg transition-all"
								>
									Full PDF
								</button>
							</div>

							<button
								onclick={resetDraw}
								class="group relative z-10 w-full overflow-hidden rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-black tracking-widest text-red-600 uppercase shadow-sm transition-all duration-300 hover:bg-red-600 hover:text-white sm:w-auto"
							>
								<span class="relative z-10 flex items-center justify-center gap-2">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
									Reset
								</span>
							</button>
						</div>
					{:else}
						<button
							onclick={handleShuffle}
							disabled={isShuffling || teamsInput.length < 2}
							class="bg-indigo-600 group relative z-10 w-full overflow-hidden rounded-xl border border-indigo-700 px-8 py-4 text-sm font-black tracking-widest text-white uppercase shadow-[0_4px_10px_rgba(79,70,229,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-neutral-900 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
						>
							<span class="relative z-10 flex items-center justify-center gap-3">
								{#if isShuffling}
									<svg
										class="h-5 w-5 animate-spin text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Shuffling...
								{:else}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-6 w-6"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
										stroke-linejoin="round"
										><path
											d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
										></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line
											x1="12"
											y1="22.08"
											x2="12"
											y2="12"
										></line></svg
									>
									Draw Match {currentMatchIndex + 1}
								{/if}
							</span>
						</button>
					{/if}
				</div>

				<!-- Matches Grid -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each drawResults as match, index}
						<div
							class="group relative overflow-hidden rounded-xl border-2 border-indigo-600 bg-white shadow-md backdrop-blur transition-all duration-300 {isShuffling
								? 'animate-pulse opacity-60'
								: ''}"
						>
							<!-- Top bar -->
							<div
								class="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-4 py-2 transition-colors hover:bg-neutral-100"
							>
								<div class="flex items-center gap-2">
									<span class="font-poppins font-black text-indigo-600 text-sm tracking-widest uppercase"
										>Match 0{index + 1}</span
									>
									<span class="text-base font-black bg-neutral-200 text-neutral-600 rounded px-2 py-0.5 tracking-wider uppercase">DAY {getMatchDay(activeLevel, activeGender, index)}</span>
									<span class="text-base font-black bg-indigo-100 text-indigo-600 border border-indigo-200 rounded px-2 py-0.5 tracking-wider lowercase">{getMatchTime(getMatchDay(activeLevel, activeGender, index), getMatchIndexInDay(activeLevel, activeGender, index))} WIB</span>
								</div>
								<span
									class="text-sm font-black tracking-widest text-neutral-400 uppercase"
									>Round of 16</span
								>
							</div>

							<div class="relative z-10 flex flex-col gap-3 p-4">
								<!-- VS Badge -->
								<div
									class="font-poppins font-black group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 absolute top-1/2 left-1/2 z-20 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs text-neutral-400 shadow-sm transition-all duration-300"
								>
									VS
								</div>

								<!-- Team 1 -->
								<div
									class="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3 transition-colors group-hover:bg-white group-hover:border-indigo-100"
								>
									<div
										class="h-8 w-1 rounded-full bg-indigo-600 shadow-sm"
									></div>
									<div
										class="text-lg font-bold {match.team1 === '?' || match.team1 === 'TBD'
											? 'text-neutral-300 italic'
											: 'text-neutral-900'} truncate tracking-wide uppercase"
									>
										{match.team1}
									</div>
								</div>

								<!-- Team 2 -->
								<div
									class="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3 transition-colors group-hover:bg-white group-hover:border-indigo-100"
								>
									<div
										class="h-8 w-1 rounded-full bg-neutral-300 group-hover:bg-red-500 shadow-sm"
									></div>
									<div
										class="text-lg font-bold {match.team2 === '?' || match.team2 === 'TBD'
											? 'text-neutral-300 italic'
											: 'text-neutral-900'} truncate tracking-wide uppercase"
									>
										{match.team2}
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
		
		{#if currentMatchIndex === -1}
			<!-- Visual Tournament Bracket Section -->
			<div class="mt-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
				<div class="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xl overflow-hidden relative group">
					<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-neutral-100 pb-6 relative z-10">
						<div>
							<h3 class="font-poppins font-black text-3xl md:text-5xl text-neutral-900 tracking-widest flex items-center gap-3">
								<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13h-4v4a2 2 0 0 1-2 2v2"/><path d="M2 13h4v4a2 2 0 0 0 2 2v2"/><path d="M8 22h8"/><path d="M8 13v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
								Tournament Bracket
							</h3>
							<p class="text-neutral-400 text-xs font-black uppercase tracking-[0.2em] mt-1">Single elimination path to the Grand Final.</p>
						</div>
						<div class="flex items-center gap-4">
							<button onclick={() => isBracketFullscreen = true} class="text-xs font-black tracking-widest text-white bg-indigo-600 hover:bg-neutral-900 transition-colors rounded-lg px-4 py-2 uppercase whitespace-nowrap shadow-sm flex items-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
								Fullscreen View
							</button>
							<span class="hidden md:inline-block text-xs font-black tracking-[0.3em] text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-5 py-2 uppercase whitespace-nowrap">
								{activeLevel} {activeGender}
							</span>
						</div>
					</div>

					<div class="overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-neutral-100 scrollbar-track-transparent relative z-10 rounded-xl">
						<div class="flex min-w-[1000px] h-[750px] gap-12 px-4">
							
							<!-- R16 Column -->
							<div class="flex flex-col justify-around h-full w-64 shrink-0 relative">
								<div class="absolute -top-4 left-0 text-xs font-black text-neutral-400 tracking-[0.3em] uppercase">Round of 16</div>
								{#each drawResults as match, i}
									<div class="bg-white border-2 border-indigo-600 rounded-xl flex flex-col justify-center h-20 shadow-sm relative group cursor-default transition-colors">
										<div class="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-1.5 px-3 truncate uppercase">{match.team1}</div>
										<div class="text-sm font-bold text-neutral-900 pt-1.5 px-3 truncate uppercase">{match.team2}</div>
										<!-- Right connection line -->
										<div class="hidden md:block absolute -right-6 top-1/2 w-6 border-t-2 border-dashed border-neutral-200 z-0 group-hover:border-indigo-300 pointer-events-none transition-colors"></div>
										<!-- small match badge -->
										<div class="absolute -left-2 top-0 -translate-y-1/2 bg-neutral-100 text-neutral-400 text-xs px-1 rounded shadow-sm border border-neutral-200 font-bold uppercase tracking-tighter flex items-center gap-1.5">
											<span>M0{i+1}</span>
											<span class="text-indigo-600/50">{getMatchTime(getMatchDay(activeLevel, activeGender, i), getMatchIndexInDay(activeLevel, activeGender, i)).split(' - ')[0]}</span>
										</div>
									</div>
								{/each}
							</div>

							<!-- Quarter Finals Column -->
							<div class="flex flex-col justify-around h-full w-64 shrink-0 relative">
								<div class="absolute -top-4 left-0 text-xs font-black text-neutral-400 tracking-[0.3em] uppercase">Quarter Final</div>
								{#each [0,1,2,3] as i}
									<div class="bg-white border-2 border-indigo-600 rounded-xl flex flex-col justify-center h-20 relative shadow-sm group transition-colors">
										<div class="text-xs text-neutral-900 border-b border-neutral-50 pb-1.5 px-3 italic uppercase font-bold">Winner M0{i*2 + 1}</div>
										<div class="text-xs text-neutral-900 pt-1.5 px-3 italic uppercase font-bold">Winner M0{i*2 + 2}</div>
										<!-- Connections -->
										<div class="hidden md:block absolute -left-6 top-1/2 w-6 border-t-2 border-dashed border-neutral-200 z-0 pointer-events-none group-hover:border-indigo-300 transition-colors"></div>
										<div class="hidden md:block absolute -right-6 top-1/2 w-6 border-t-2 border-dashed border-neutral-200 z-0 pointer-events-none group-hover:border-indigo-300 transition-colors"></div>
										<!-- badge -->
										<div class="absolute -left-2 top-0 -translate-y-1/2 bg-neutral-100 text-neutral-400 text-xs px-1 rounded shadow-sm border border-neutral-200 font-bold uppercase tracking-tighter flex items-center gap-1.5">
											<span>QF0{i+1}</span>
											<span class="text-indigo-600/50">
												{['15.30', '16.30', '19.00', '20.00'][i]}
											</span>
										</div>
									</div>
								{/each}
							</div>

							<!-- Semi Finals Column -->
							<div class="flex flex-col justify-around h-full w-64 shrink-0 relative">
								<div class="absolute -top-4 left-0 text-xs font-black text-neutral-400 tracking-[0.3em] uppercase">Semi Final</div>
								{#each [0,1] as i}
									<div class="bg-white border-2 border-indigo-600 rounded-xl flex flex-col justify-center h-20 relative shadow-sm group transition-colors">
										<div class="text-xs text-neutral-900 border-b border-neutral-50 pb-1.5 px-3 italic uppercase font-bold">Winner QF 0{i*2 + 1}</div>
										<div class="text-xs text-neutral-900 pt-1.5 px-3 italic uppercase font-bold">Winner QF 0{i*2 + 2}</div>
										<!-- Connections -->
										<div class="hidden md:block absolute -left-6 top-1/2 w-6 border-t-2 border-dashed border-neutral-200 z-0 pointer-events-none group-hover:border-indigo-300 transition-colors"></div>
										<div class="hidden md:block absolute -right-6 top-1/2 w-6 border-t-2 border-dashed border-neutral-200 z-0 pointer-events-none group-hover:border-indigo-300 transition-colors"></div>
										<!-- badge -->
										<div class="absolute -left-2 top-0 -translate-y-1/2 bg-neutral-100 text-neutral-400 text-xs px-1 rounded shadow-sm border border-neutral-200 font-bold uppercase tracking-tighter flex items-center gap-1.5">
											<span>SF0{i+1}</span>
											<span class="text-indigo-600/50">
												{['15.30', '16.30'][i]}
											</span>
										</div>
									</div>
								{/each}
							</div>

							<!-- Final & 3rd Place Column -->
							<div class="flex flex-col justify-around h-full w-64 shrink-0 relative">
								<div class="absolute -top-4 left-0 text-xs font-black text-indigo-600 tracking-[0.3em] uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shadow-sm">Rankings</div>
								
								<!-- Grand Final -->
								<div class="flex flex-col gap-2">
									<div class="flex items-center justify-between ml-1 pr-1">
										<div class="text-xs font-bold text-neutral-900 uppercase opacity-40 tracking-widest">Grand Final</div>
										<div class="text-xs font-black text-indigo-600/60 uppercase">20.00</div>
									</div>
									<div class="bg-indigo-600 border-2 border-indigo-400 shadow-xl shadow-indigo-100 rounded-xl flex flex-col justify-center py-4 relative z-10 transition-all cursor-pointer hover:bg-neutral-900">
										<div class="text-xs font-black text-white text-center mb-3 tracking-[0.3em] uppercase opacity-90">CHAMPIONSHIP</div>
										<div class="text-sm text-indigo-100 border-b border-white/10 pb-2 px-4 flex justify-between italic uppercase font-bold">Winner SF 01</div>
										<div class="text-sm text-indigo-100 pt-2 px-4 flex justify-between italic uppercase font-bold">Winner SF 02</div>
										<!-- Connection -->
										<div class="hidden md:block absolute -left-6 top-1/2 w-6 border-t-2 border-dashed border-indigo-300 z-0 pointer-events-none"></div>
									</div>
								</div>

								<!-- 3rd Place -->
								<div class="flex flex-col gap-2">
									<div class="flex items-center justify-between ml-1 pr-1">
										<div class="text-xs font-bold text-orange-600 uppercase opacity-40 tracking-widest">3rd Place Match</div>
										<div class="text-xs font-black text-orange-600/60 uppercase">19.00</div>
									</div>
									<div class="bg-white border-2 border-indigo-600 shadow-sm rounded-xl flex flex-col justify-center py-4 relative z-10 transition-all cursor-pointer">
										<div class="text-xs font-black text-orange-600 text-center mb-3 tracking-[0.3em] uppercase">BRONZE FINAL</div>
										<div class="text-sm text-neutral-900 border-b border-neutral-50 pb-2 px-4 flex justify-between italic uppercase font-bold">Loser SF 01</div>
										<div class="text-sm text-neutral-900 pt-2 px-4 flex justify-between italic uppercase font-bold">Loser SF 02</div>
									</div>
								</div>
							</div>

						</div>
					</div>
				</div>
			</div>
		{/if}
	</main>

	{#if isModalOpen}
		<div class="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/98 backdrop-blur-2xl transition-all duration-500">
			<!-- Dramatic background stuff -->
			<div class="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
				<div class="absolute w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] bg-indigo-500/10 rounded-full blur-[120px] {isShuffling ? 'animate-pulse' : 'scale-125 opacity-20 bg-indigo-600/20' } transition-all duration-1000"></div>
			</div>

			<div class="z-10 w-full max-w-6xl px-4 flex flex-col items-center justify-center text-center">
				<h1 class="font-bebas text-4xl md:text-6xl text-white tracking-[0.3em] mb-12 uppercase drop-shadow-[0_0_15px_rgba(79,70,229,0.4)]">
					Yadika Cup <span class="text-indigo-500">-</span> Basketball Drawing
				</h1>
				<div class="mb-8 flex items-center justify-center gap-4 flex-wrap">
					<span class="text-sm md:text-xl font-bebas tracking-widest text-white bg-neutral-900 border border-neutral-700 rounded-full px-8 py-3 shadow-sm uppercase">
						{activeLevel} {activeGender}
					</span>
					<span class="text-base md:text-2xl font-bebas tracking-widest text-white bg-indigo-600 border border-indigo-500 rounded-full px-10 py-3 shadow-xl shadow-indigo-500/30 uppercase">DAY {shuffleDay}</span>
					<span class="text-base md:text-2xl font-bebas tracking-widest text-white bg-blue-600 border border-blue-500 rounded-full px-10 py-3 shadow-xl shadow-blue-500/30 uppercase">{shuffleTime} WIB</span>
				</div>
				<h2 class="font-poppins font-black tracking-[0.3em] uppercase mb-12 {isShuffling ? 'text-indigo-400 animate-pulse text-2xl md:text-3xl' : 'text-white text-3xl md:text-4xl'} transition-all duration-300">
					{#if isShuffling}
						Drawing Match 0{shuffleMatchIndex + 1}...
					{:else}
						Match 0{shuffleMatchIndex + 1} Confirmed!
					{/if}
				</h2>

				<div class="flex flex-col md:flex-row items-center justify-center w-full gap-6 md:gap-12">
					<!-- Team 1 box -->
					<div class="relative w-full md:w-5/12 h-32 md:h-64 border-2 {isShuffling ? 'border-neutral-800 bg-white/5' : 'border-indigo-500 bg-white/10 shadow-2xl shadow-indigo-500/20'} rounded-3xl flex items-center justify-center overflow-hidden transition-all duration-500 p-6 backdrop-blur-md">
						<h3 class="font-bold text-3xl md:text-5xl uppercase {isShuffling ? 'text-neutral-700' : 'text-white'} transition-all w-full text-center leading-tight">
							{shuffleTeam1}
						</h3>
					</div>

					<!-- VS -->
					<div class="font-poppins font-black text-5xl md:text-7xl {isShuffling ? 'text-neutral-800 scale-90' : 'text-indigo-400 scale-110'} transition-all duration-500 z-10 shrink-0">
						VS
					</div>

					<!-- Team 2 box -->
					<div class="relative w-full md:w-5/12 h-32 md:h-64 border-2 {isShuffling ? 'border-neutral-800 bg-white/5' : 'border-indigo-500 bg-white/10 shadow-2xl shadow-indigo-500/20'} rounded-3xl flex items-center justify-center overflow-hidden transition-all duration-500 p-6 backdrop-blur-md">
						<h3 class="font-bold text-3xl md:text-5xl uppercase {isShuffling ? 'text-neutral-700' : 'text-white'} transition-all w-full text-center leading-tight">
							{shuffleTeam2}
						</h3>
					</div>
				</div>

				<!-- Buttons -->
				<div class="mt-16 h-16 flex items-center justify-center gap-4 md:gap-6 flex-wrap">
					{#if !isShuffling}
						{#if currentMatchIndex !== -1 && teamsInput.length - drawResults.flatMap(m => [m.team1, m.team2]).filter(t => t !== '?' && t !== 'TBD').length >= 2}
							<button
								onclick={nextShuffle}
								class="bg-indigo-600 group relative z-10 overflow-hidden rounded-xl px-8 py-3 md:py-4 text-xs font-black tracking-widest text-white uppercase shadow-lg transition-all duration-300 hover:bg-neutral-900 active:scale-95"
							>
								<span class="relative z-10 flex items-center gap-3">
									Next Shuffle
									<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
								</span>
							</button>
						{/if}
						<button
							onclick={closeModal}
							class="bg-neutral-900 border border-neutral-800 px-8 py-3 md:py-4 text-xs font-bold tracking-widest text-neutral-400 uppercase shadow-sm transition-all duration-300 hover:bg-neutral-800 active:scale-95 rounded-xl"
						>
							<span class="relative z-10">Back to Menu</span>
						</button>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	{#if isBracketFullscreen}
		<div class="fixed inset-0 z-110 flex flex-col bg-white transition-all duration-500 overflow-hidden">
			<!-- Header -->
			<div class="w-full flex items-center justify-between p-6 border-b border-neutral-100 bg-white shadow-sm relative z-20">
				<div class="flex items-center gap-6">
					<h3 class="font-poppins font-black text-3xl text-neutral-900 tracking-widest flex items-center gap-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13h-4v4a2 2 0 0 1-2 2v2"/><path d="M2 13h4v4a2 2 0 0 0 2 2v2"/><path d="M8 22h8"/><path d="M8 13v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
						Tournament Bracket
					</h3>
					<span class="text-xs font-black tracking-[0.3em] text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 uppercase hidden md:inline-block">
						{activeLevel} {activeGender}
					</span>
				</div>
				<button onclick={() => isBracketFullscreen = false} class="bg-neutral-50 hover:bg-neutral-100 text-neutral-400 rounded-full p-3 transition-colors border border-neutral-100 shadow-sm" aria-label="Close fullscreen view">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
				</button>
			</div>

			<!-- Bracket Scroll Container -->
			<div class="flex-1 w-full overflow-auto scrollbar-thin scrollbar-thumb-neutral-100 scrollbar-track-transparent relative z-10 p-8 md:p-12 bg-neutral-50/30">
				<div class="flex min-w-[1200px] h-[800px] gap-12 px-4 mx-auto max-w-[1400px]">
					
					<!-- R16 Column -->
					<div class="flex flex-col justify-around h-full w-72 shrink-0 relative">
						<div class="absolute -top-4 left-0 text-xs font-black text-neutral-400 tracking-[0.3em] uppercase">Round of 16</div>
						{#each drawResults as match, i}
							<div class="bg-white border-2 border-indigo-600 rounded-2xl flex flex-col justify-center h-24 shadow-sm relative group cursor-default transition-colors">
								<div class="text-base font-bold text-neutral-900 border-b border-neutral-50 pb-1.5 px-4 truncate uppercase tracking-wide">{match.team1}</div>
								<div class="text-base font-bold text-neutral-900 pt-1.5 px-4 truncate uppercase tracking-wide">{match.team2}</div>
								<!-- Right connection line -->
								<div class="hidden md:block absolute -right-6 top-1/2 w-6 border-t-[3px] border-dashed border-neutral-200 z-0 group-hover:border-indigo-300 pointer-events-none transition-colors"></div>
								<!-- small match badge -->
								<div class="absolute -left-3 top-0 -translate-y-1/2 bg-neutral-100 text-neutral-400 font-bold text-xs px-2 py-0.5 rounded shadow-sm border border-neutral-200 uppercase tracking-tighter">M0{i+1}</div>
							</div>
						{/each}
					</div>

					<!-- Quarter Finals Column -->
					<div class="flex flex-col justify-around h-full w-72 shrink-0 relative">
						<div class="absolute -top-4 left-0 text-xs font-black text-neutral-400 tracking-[0.3em] uppercase">Quarter Final</div>
						{#each [0,1,2,3] as i}
							<div class="bg-white border-2 border-indigo-600 rounded-2xl flex flex-col justify-center h-24 relative shadow-sm group transition-colors">
								<div class="text-sm text-neutral-900 border-b border-neutral-50 pb-1.5 px-4 italic uppercase font-black">Winner M0{i*2 + 1}</div>
								<div class="text-sm text-neutral-900 pt-1.5 px-4 italic uppercase font-black">Winner M0{i*2 + 2}</div>
								<!-- Connections -->
								<div class="hidden md:block absolute -left-6 top-1/2 w-6 border-t-[3px] border-dashed border-neutral-200 z-0 pointer-events-none group-hover:border-indigo-300 transition-colors"></div>
								<div class="hidden md:block absolute -right-6 top-1/2 w-6 border-t-[3px] border-dashed border-neutral-200 z-0 pointer-events-none group-hover:border-indigo-300 transition-colors"></div>
								<div class="absolute -left-3 top-0 -translate-y-1/2 bg-neutral-100 text-neutral-400 font-bold text-xs px-2 py-0.5 rounded shadow-sm border border-neutral-200 uppercase tracking-tighter">QF0{i+1}</div>
							</div>
						{/each}
					</div>

					<!-- Semi Finals Column -->
					<div class="flex flex-col justify-around h-full w-72 shrink-0 relative">
						<div class="absolute -top-4 left-0 text-xs font-black text-neutral-400 tracking-[0.3em] uppercase">Semi Final</div>
						{#each [0,1] as i}
							<div class="bg-white border-2 border-indigo-600 rounded-2xl flex flex-col justify-center h-24 relative shadow-sm group transition-colors">
								<div class="text-sm text-neutral-900 border-b border-neutral-50 pb-1.5 px-4 italic uppercase font-black">Winner QF 0{i*2 + 1}</div>
								<div class="text-sm text-neutral-900 pt-1.5 px-4 italic uppercase font-black">Winner QF 0{i*2 + 2}</div>
								<!-- Connections -->
								<div class="hidden md:block absolute -left-6 top-1/2 w-6 border-t-[3px] border-dashed border-neutral-200 z-0 pointer-events-none group-hover:border-indigo-300 transition-colors"></div>
								<div class="hidden md:block absolute -right-6 top-1/2 w-6 border-t-[3px] border-dashed border-neutral-200 z-0 pointer-events-none group-hover:border-indigo-300 transition-colors"></div>
								<div class="absolute -left-3 top-0 -translate-y-1/2 bg-neutral-100 text-neutral-400 font-bold text-xs px-2 py-0.5 rounded shadow-sm border border-neutral-200 uppercase tracking-tighter">SF0{i+1}</div>
							</div>
						{/each}
					</div>

					<!-- Final & 3rd Place Column -->
					<div class="flex flex-col justify-around h-full w-72 shrink-0 relative">
						<div class="absolute -top-4 left-0 text-xs font-black text-indigo-600 tracking-[0.3em] uppercase bg-indigo-50 px-3 py-1 rounded border border-indigo-100 shadow-sm">Rankings</div>
						
						<!-- Grand Final -->
						<div class="flex flex-col gap-3">
							<div class="text-xs font-bold text-neutral-900 uppercase opacity-30 ml-2 tracking-widest">Grand Final</div>
							<div class="bg-indigo-600 border-2 border-indigo-400 shadow-xl shadow-indigo-100 rounded-2xl flex flex-col justify-center py-6 relative z-10 transition-all cursor-pointer hover:bg-neutral-900">
								<div class="text-xs font-black text-white text-center mb-4 tracking-[0.3em] uppercase opacity-90">CHAMPIONSHIP</div>
								<div class="text-base text-indigo-100 border-b border-white/10 pb-3 px-6 flex justify-between italic uppercase font-bold">Winner SF 01</div>
								<div class="text-base text-indigo-100 pt-3 px-6 flex justify-between italic uppercase font-bold">Winner SF 02</div>
								<!-- Connection -->
								<div class="hidden md:block absolute -left-6 top-1/2 w-6 border-t-[3px] border-dashed border-indigo-300 z-0 pointer-events-none"></div>
							</div>
						</div>

						<!-- 3rd Place Match -->
						<div class="flex flex-col gap-3">
							<div class="text-xs font-bold text-orange-600 uppercase opacity-30 ml-2 tracking-widest">3rd Place Match</div>
							<div class="bg-white border-2 border-indigo-600 shadow-sm rounded-2xl flex flex-col justify-center py-6 relative z-10 transition-all cursor-pointer text-center">
								<div class="text-xs font-black text-orange-600 text-center mb-4 tracking-[0.3em] uppercase">BRONZE FINAL</div>
								<div class="text-base text-neutral-900 border-b border-neutral-50 pb-3 px-6 flex justify-between italic uppercase font-black">Loser SF 01</div>
								<div class="text-base text-neutral-900 pt-3 px-6 flex justify-between italic uppercase font-black">Loser SF 02</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<NotificationModal 
		isOpen={resetModal.isOpen}
		title={resetModal.title}
		message={resetModal.message}
		type="confirm"
		onConfirm={resetModal.onConfirm}
		onClose={() => resetModal.isOpen = false}
		onCancel={() => resetModal.isOpen = false}
	/>

	<NotificationModal 
		isOpen={drawModal.isOpen}
		title={drawModal.title}
		message={drawModal.message}
		type="confirm"
		onConfirm={drawModal.onConfirm}
		onClose={() => drawModal.isOpen = false}
		onCancel={() => drawModal.isOpen = false}
	/>
</div>

<style>
	:global(body) {
		background-color: #f8fafc;
	}

	/* Custom Scrollbar for the table and list */
	:global(.scrollbar-thin::-webkit-scrollbar) {
		width: 6px;
		height: 6px;
	}
	:global(.scrollbar-thin::-webkit-scrollbar-thumb) {
		background: #e5e5e5;
		border-radius: 10px;
	}
	:global(.scrollbar-thin::-webkit-scrollbar-thumb:hover) {
		background: #d4d4d4;
	}
	:global(.scrollbar-thin::-webkit-scrollbar-track) {
		background: transparent;
	}
</style>

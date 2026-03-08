<script>
	let activeTab = $state('All'); // 'All', 'SMA Putra', 'SMA Putri', 'SMP Putra', 'SMP Putri'
	const tabs = ['All', 'SMA Putra', 'SMA Putri', 'SMP Putra', 'SMP Putri'];

	// Generate standard times based on day rules
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
			'15.30 - 16.30',
			'16.30 - 17.30',
			'19.00 - 20.00',
			'20.00 - 21.00'
		];

		const times = day >= 7 ? day7PlusTimes : (day === 5 || day === 6) ? day5or6Times : standardTimes;
		return times[matchIndexInDay] || 'TBD';
	}

	function getMatchIndexInDay(generatedMatches, match) {
		let count = 0;
		for (const m of generatedMatches) {
			if (m === match) break;
			if (m.day === match.day) count++;
		}
		return count;
	}

	let scheduleData = $state([]);

	$effect(() => {
		const loadedData = [];
		const categories = [
			{ key: 'sma-putra', level: 'SMA', gender: 'Putra' },
			{ key: 'sma-putri', level: 'SMA', gender: 'Putri' },
			{ key: 'smp-putra', level: 'SMP', gender: 'Putra' },
			{ key: 'smp-putri', level: 'SMP', gender: 'Putri' }
		];

		const allMatchResults = {};
		categories.forEach(cat => {
			const saved = localStorage.getItem(`results_${cat.key}`);
			if (saved) {
				allMatchResults[cat.key] = JSON.parse(saved);
			} else {
				allMatchResults[cat.key] = Array(8).fill(null).map(() => ({ team1: 'TBD', team2: 'TBD' }));
			}
		});

		let matchIdCounter = 1;
		
		const addMatch = (day, matchStrId, round, level, gender, matchData) => {
			loadedData.push({
				id: matchIdCounter++,
				day,
				matchStrId,
				round,
				level,
				gender,
				category: `${level} ${gender}`,
				team1: matchData && matchData.team1 !== '?' ? matchData.team1 : 'TBD',
				team2: matchData && matchData.team2 !== '?' ? matchData.team2 : 'TBD'
			});
		};

		// --- Day 1 to 6: Round of 16 ---
		addMatch(1, 'M01', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][0]);
		addMatch(1, 'M02', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][1]);
		addMatch(1, 'M03', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][2]);
		addMatch(1, 'M01', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][0]);
		addMatch(1, 'M02', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][1]);

		addMatch(2, 'M01', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][0]);
		addMatch(2, 'M02', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][1]);
		addMatch(2, 'M03', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][2]);
		addMatch(2, 'M01', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][0]);
		addMatch(2, 'M02', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][1]);

		addMatch(3, 'M04', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][3]);
		addMatch(3, 'M05', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][4]);
		addMatch(3, 'M03', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][2]);
		addMatch(3, 'M04', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][3]);
		addMatch(3, 'M05', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][4]);

		addMatch(4, 'M04', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][3]);
		addMatch(4, 'M05', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][4]);
		addMatch(4, 'M03', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][2]);
		addMatch(4, 'M04', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][3]);
		addMatch(4, 'M05', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][4]);

		addMatch(5, 'M06', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][5]);
		addMatch(5, 'M07', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][6]);
		addMatch(5, 'M08', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][7]);
		addMatch(5, 'M06', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][5]);
		addMatch(5, 'M07', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][6]);
		addMatch(5, 'M08', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][7]);

		addMatch(6, 'M06', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][5]);
		addMatch(6, 'M07', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][6]);
		addMatch(6, 'M08', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][7]);
		addMatch(6, 'M06', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][5]);
		addMatch(6, 'M07', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][6]);
		addMatch(6, 'M08', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][7]);

		// --- Day 7 to 10: Quarter Finals ---
		addMatch(7, 'QF01', 'Quarter Final', 'SMA', 'Putra', null);
		addMatch(7, 'QF02', 'Quarter Final', 'SMA', 'Putra', null);
		addMatch(7, 'QF01', 'Quarter Final', 'SMA', 'Putri', null);
		addMatch(7, 'QF02', 'Quarter Final', 'SMA', 'Putri', null);

		addMatch(8, 'QF01', 'Quarter Final', 'SMP', 'Putra', null);
		addMatch(8, 'QF02', 'Quarter Final', 'SMP', 'Putra', null);
		addMatch(8, 'QF01', 'Quarter Final', 'SMP', 'Putri', null);
		addMatch(8, 'QF02', 'Quarter Final', 'SMP', 'Putri', null);

		addMatch(9, 'QF03', 'Quarter Final', 'SMA', 'Putra', null);
		addMatch(9, 'QF04', 'Quarter Final', 'SMA', 'Putra', null);
		addMatch(9, 'QF03', 'Quarter Final', 'SMA', 'Putri', null);
		addMatch(9, 'QF04', 'Quarter Final', 'SMA', 'Putri', null);

		addMatch(10, 'QF03', 'Quarter Final', 'SMP', 'Putra', null);
		addMatch(10, 'QF04', 'Quarter Final', 'SMP', 'Putra', null);
		addMatch(10, 'QF03', 'Quarter Final', 'SMP', 'Putri', null);
		addMatch(10, 'QF04', 'Quarter Final', 'SMP', 'Putri', null);

		// --- Day 11 to 12: Semi Finals ---
		addMatch(11, 'SF01', 'Semi Final', 'SMA', 'Putra', null);
		addMatch(11, 'SF02', 'Semi Final', 'SMA', 'Putra', null);
		addMatch(11, 'SF01', 'Semi Final', 'SMA', 'Putri', null);
		addMatch(11, 'SF02', 'Semi Final', 'SMA', 'Putri', null);

		addMatch(12, 'SF01', 'Semi Final', 'SMP', 'Putra', null);
		addMatch(12, 'SF02', 'Semi Final', 'SMP', 'Putra', null);
		addMatch(12, 'SF01', 'Semi Final', 'SMP', 'Putri', null);
		addMatch(12, 'SF02', 'Semi Final', 'SMP', 'Putri', null);

		// --- Day 13: Grand Finals ---
		addMatch(13, 'GF', 'Grand Final', 'SMP', 'Putri', null);
		addMatch(13, 'GF', 'Grand Final', 'SMP', 'Putra', null);
		addMatch(13, 'GF', 'Grand Final', 'SMA', 'Putri', null);
		addMatch(13, 'GF', 'Grand Final', 'SMA', 'Putra', null);

		scheduleData = loadedData.map((match, i) => {
			let time;
			
			if (match.round === 'Quarter Final') {
				const isPutra = match.gender === 'Putra';
				const qfTimes = ['15.30 - 16.30', '16.30 - 17.30', '19.00 - 20.00', '20.00 - 21.00'];
				if (match.day === 7 || match.day === 8) {
					time = isPutra ? 
						(match.matchStrId === 'QF01' ? qfTimes[2] : qfTimes[3]) : 
						(match.matchStrId === 'QF01' ? qfTimes[0] : qfTimes[1]);
				} else {
					time = isPutra ? 
						(match.matchStrId === 'QF03' ? qfTimes[2] : qfTimes[3]) : 
						(match.matchStrId === 'QF03' ? qfTimes[0] : qfTimes[1]);
				}
			} else if (match.round === 'Semi Final') {
				const sfTimes = ['15.30 - 16.30', '16.30 - 17.30', '19.00 - 20.00', '20.00 - 21.00'];
				const isPutra = match.gender === 'Putra';
				time = isPutra ? 
					(match.matchStrId === 'SF01' ? sfTimes[2] : sfTimes[3]) : 
					(match.matchStrId === 'SF01' ? sfTimes[0] : sfTimes[1]);
			} else if (match.round === 'Grand Final') {
				if (match.category === 'SMP Putri') time = '15.30 - 16.30';
				if (match.category === 'SMP Putra') time = '16.30 - 17.30';
				if (match.category === 'SMA Putri') time = '19.00 - 20.00';
				if (match.category === 'SMA Putra') time = '20.00 - 21.00';
			} else {
				const indexInDay = getMatchIndexInDay(loadedData, match);
				time = getMatchTime(match.day, indexInDay);
			}

			if (match.team1 === 'TBD' || match.team1 === '?') {
				if (match.round === 'Quarter Final') {
					if (match.matchStrId === 'QF01') { match.team1 = 'Winner M01'; match.team2 = 'Winner M02'; }
					if (match.matchStrId === 'QF02') { match.team1 = 'Winner M03'; match.team2 = 'Winner M04'; }
					if (match.matchStrId === 'QF03') { match.team1 = 'Winner M05'; match.team2 = 'Winner M06'; }
					if (match.matchStrId === 'QF04') { match.team1 = 'Winner M07'; match.team2 = 'Winner M08'; }
				}
				if (match.round === 'Semi Final') {
					if (match.matchStrId === 'SF01') { match.team1 = 'Winner QF01'; match.team2 = 'Winner QF02'; }
					if (match.matchStrId === 'SF02') { match.team1 = 'Winner QF03'; match.team2 = 'Winner QF04'; }
				}
				if (match.round === 'Grand Final') {
					match.team1 = 'Winner SF01'; match.team2 = 'Winner SF02';
				}
			}

			return { ...match, time };
		});
	});

	let filteredSchedule = $derived(
		activeTab === 'All' 
			? scheduleData 
			: scheduleData.filter(m => m.category === activeTab)
	);

	let groupedSchedule = $derived.by(() => {
		const groups = {};
		filteredSchedule.forEach(match => {
			if (!groups[match.day]) {
				groups[match.day] = [];
			}
			groups[match.day].push(match);
		});
		return Object.keys(groups).map(day => ({
			day: parseInt(day),
			matches: groups[day]
		})).sort((a, b) => a.day - b.day);
	});

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
</script>

<svelte:head>
	<title>Tournament Schedule | Championship Draw</title>
</svelte:head>

<div class="min-h-screen bg-neutral-50 text-neutral-900 font-poppins selection:bg-indigo-500 selection:text-white">
	<!-- Navbar -->
	<header class="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-xl shadow-sm">
		<div class="container mx-auto px-4 md:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 py-4 md:flex-row">
			<div class="flex items-center space-x-4">
				<a href="/" class="bg-indigo-600 flex h-11 w-11 items-center justify-center rounded-xl shadow-[0_4px_10px_rgba(79,70,229,0.3)] hover:scale-105 hover:bg-neutral-900 transition-all cursor-pointer">
					<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
				</a>
				<div>
					<h1 class="font-poppins font-black text-2xl md:text-3xl leading-none tracking-wider text-neutral-900 uppercase">
						Match <span class="text-indigo-600">Schedule</span>
					</h1>
					<p class="text-xs font-bold text-neutral-400 flex items-center gap-2 tracking-widest uppercase mt-0.5">
						<span class="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
						13 Days Tournament
					</p>
				</div>
			</div>
			
			<!-- Category Toggle -->
			<nav class="flex flex-wrap items-center justify-center bg-neutral-100 p-1 rounded-2xl border border-neutral-200 w-full md:w-auto shadow-sm">
				{#each tabs as tab}
					<button 
						onclick={() => activeTab = tab}
						class="flex-1 md:flex-none rounded-xl px-4 md:px-6 py-2.5 text-xs md:text-sm font-bold uppercase transition-all duration-300 tracking-wider whitespace-nowrap
						{activeTab === tab ? 'bg-white text-indigo-600 shadow-sm border border-neutral-200 scale-100' : 'text-neutral-500 hover:text-neutral-900 scale-95 hover:scale-100'}"
					>
						{tab}
					</button>
				{/each}
			</nav>
		</div>
	</header>

	<main class="container mx-auto p-4 md:p-6 lg:p-8">
		
		{#if groupedSchedule.length === 0}
			<div class="flex flex-col items-center justify-center p-20 bg-white/50 rounded-[30px] border-2 border-dashed border-neutral-200 mt-12 backdrop-blur-sm">
				<div class="bg-indigo-50 p-6 rounded-3xl text-indigo-300 mb-6 border border-indigo-100 shadow-inner">
					<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
				</div>
				<h3 class="font-poppins font-black text-2xl text-neutral-400 tracking-widest uppercase mb-2">No Matches Found</h3>
				<p class="text-neutral-400 text-sm font-medium tracking-wide">Select another category or check the draw results.</p>
			</div>
		{:else}
			<div class="space-y-16 pb-24 mt-8">
				{#each groupedSchedule as dayGroup}
					<div class="relative animate-in slide-in-from-bottom-8 duration-700 fade-in fill-mode-both" style="animation-delay: {dayGroup.day * 60}ms">
						
						<!-- Day Header Container -->
						<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-[24px] border border-neutral-200 shadow-xl shadow-neutral-200/50 backdrop-blur-xl relative z-20">
							<div class="flex items-center gap-6">
								<div class="bg-indigo-600 w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] shrink-0">
									<span class="text-[10px] uppercase font-black tracking-[0.3em] opacity-80 mb-0.5">Day</span>
									<span class="font-poppins font-black text-4xl leading-none">{dayGroup.day}</span>
								</div>
								<div>
									<h2 class="font-poppins font-black text-2xl md:text-3xl text-neutral-900 tracking-wide mb-1 uppercase">
										{getActualDate(dayGroup.day).split(',')[0]}<span class="text-indigo-600">,</span> {getActualDate(dayGroup.day).split(',')[1]}
									</h2>
									<div class="flex items-center gap-3">
										{#if dayGroup.day === 13}
											<span class="bg-amber-100 text-amber-700 border border-amber-200 text-[11px] px-3 py-1 rounded-lg font-black uppercase tracking-widest shadow-sm">🏆 Grand Final Matchday</span>
										{:else if dayGroup.day >= 11}
											<span class="bg-red-50 text-red-600 border border-red-200 text-[11px] px-3 py-1 rounded-lg font-black uppercase tracking-widest shadow-sm">🔥 Semi Final</span>
										{:else if dayGroup.day >= 7}
											<span class="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[11px] px-3 py-1 rounded-lg font-black uppercase tracking-widest shadow-sm">⚔️ Quarter Final</span>
										{:else}
											<span class="bg-neutral-100 text-neutral-600 border border-neutral-200 text-[11px] px-3 py-1 rounded-lg font-black uppercase tracking-widest shadow-sm">🎯 Round of 16</span>
										{/if}
										<span class="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 hidden sm:flex">
											<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
											{dayGroup.matches.length} Matches Scheduled
										</span>
									</div>
								</div>
							</div>
						</div>

						<!-- Matches Grid -->
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-5 px-0 md:px-6 relative z-10 -mt-2">
							{#each dayGroup.matches as match}
								<!-- Match Card -->
								<div class="group bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 
									{(match.team1 !== 'TBD' && !match.team1.includes('Winner')) || match.round === 'Grand Final' ? 'border-indigo-600 hover:shadow-indigo-500/10' : 'border-neutral-200/80 hover:border-indigo-300'}">
									
									<!-- Top Bar -->
									<div class="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50 group-hover:bg-indigo-50/30 transition-colors">
										<div class="flex items-center gap-3">
											<div class="font-poppins font-black {match.round === 'Grand Final' ? 'text-amber-600' : 'text-indigo-600'} text-[11px] tracking-widest uppercase">
												{match.round === 'Grand Final' ? `Final ${match.category}` : `Match ${match.matchStrId}`}
											</div>
											<div class="w-1.5 h-1.5 rounded-full bg-neutral-300"></div>
											<div class="text-xs font-black {match.round === 'Grand Final' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-indigo-100 text-indigo-600 border-indigo-200'} border rounded px-2.5 py-0.5 tracking-wider font-mono">
												{match.time}
											</div>
										</div>
										<div class="flex items-center gap-2">
											{#if match.round !== 'Grand Final'}
												<span class="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm {match.level === 'SMA' ? 'bg-blue-600 text-white border border-blue-700' : 'bg-orange-500 text-white border border-orange-600'}">
													{match.category}
												</span>
											{:else}
												<span class="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm bg-neutral-900 text-white border border-neutral-800">
													🏆 CHAMPIONSHIP
												</span>
											{/if}
										</div>
									</div>

									<!-- Match Content -->
									<div class="p-6 relative">
										<!-- VS Badge -->
										<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-neutral-200 rounded-full flex items-center justify-center shadow-lg font-poppins font-black text-xs text-neutral-400 group-hover:scale-110 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all duration-300">
											VS
										</div>

										<div class="flex flex-col gap-4">
											<!-- Team 1 -->
											<div class="flex items-center gap-4 border border-neutral-100 rounded-xl p-4 transition-all duration-300 bg-neutral-50/50 group-hover:border-indigo-100 group-hover:bg-white relative overflow-hidden">
												<div class="w-1.5 h-full absolute left-0 top-0 bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
												<div class="pl-2 flex-col flex w-full">
													<div class="text-[10px] font-black text-neutral-400 tracking-widest uppercase mb-1">Home Team</div>
													<div class="font-poppins font-bold text-lg leading-tight uppercase tracking-wider truncate {(match.team1 === 'TBD' || match.team1.includes('Winner')) ? 'text-neutral-400 italic font-medium' : 'text-neutral-900'}">
														{match.team1}
													</div>
												</div>
											</div>

											<!-- Team 2 -->
											<div class="flex items-center gap-4 border border-neutral-100 rounded-xl p-4 transition-all duration-300 bg-neutral-50/50 group-hover:border-indigo-100 group-hover:bg-white relative overflow-hidden">
												<div class="w-1.5 h-full absolute left-0 top-0 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
												<div class="pl-2 flex-col flex w-full">
													<div class="text-[10px] font-black text-neutral-400 tracking-widest uppercase mb-1">Away Team</div>
													<div class="font-poppins font-bold text-lg leading-tight uppercase tracking-wider truncate {(match.team2 === 'TBD' || match.team2.includes('Winner')) ? 'text-neutral-400 italic font-medium' : 'text-neutral-900'}">
														{match.team2}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

<style>
	:global(body) {
		background-color: #f8fafc;
	}
</style>

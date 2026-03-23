<script>
	import { onMount } from 'svelte';
	import { jsPDF } from "jspdf";
	import autoTable from "jspdf-autotable";
	import { NotificationModal } from '$lib/components/ui';
	import { MatchCard } from '$lib/components/features';
	import { TeamInput, DrawControl } from '$lib/components/features/DrawPage';
	import { drawService } from '$lib/services';
	import { getMatchDay, getMatchTime, getMatchIndexInDay } from '$lib/utils';
	
	let activeLevel = $state('SMA');
	let activeGender = $state('Putra');
	
	let teamsInput = $state([]);
	let drawResults = $state(Array(8).fill({ team1: '?', team2: '?' }));
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
		const doc = new jsPDF();
		const title = `Tournament Schedule - ${activeLevel} ${activeGender}`;
		doc.setFontSize(20);
		doc.text("TOURNAMENT DRAW RESULTS", 105, 15, { align: "center" });
		doc.setFontSize(14);
		doc.text(title, 105, 25, { align: "center" });
		doc.setFontSize(10);
		doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 32, { align: "center" });
		
		const tableData = drawResults.map((r, i) => {
			const day = getMatchDay(activeLevel, activeGender, i);
			const time = getMatchTime(day, getMatchIndexInDay(activeLevel, activeGender, i));
			return [`M${i + 1}`, `Day ${day}`, time, r.team1 === '?' ? 'TBD' : r.team1, 'VS', r.team2 === '?' ? 'TBD' : r.team2];
		});
		
		autoTable(doc, {
			startY: 40,
			head: [['Match', 'Day', 'Time', 'Team 1', '', 'Team 2']],
			body: tableData,
			theme: 'striped',
			headStyles: { fillColor: [79, 70, 229], textColor: 255 },
			styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
			columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 20 }, 2: { cellWidth: 35 }, 3: { cellWidth: 'auto', fontStyle: 'bold' }, 4: { cellWidth: 15, halign: 'center', textColor: [150, 150, 150] }, 5: { cellWidth: 'auto', fontStyle: 'bold' } }
		});
		const category = `${activeLevel.toLowerCase()}-${activeGender.toLowerCase()}`;
		doc.save(`Draw_Results_${category}.pdf`);
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
			<div class="flex gap-3">
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

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each drawResults as match, index}
						<MatchCard {match} {index} level={activeLevel} gender={activeGender} />
					{/each}
				</div>
			</div>
		</div>
	</main>
</div>

<NotificationModal isOpen={resetModal.isOpen} title={resetModal.title} message={resetModal.message} type="confirm" onConfirm={resetModal.onConfirm} onClose={() => resetModal.isOpen = false} onCancel={() => resetModal.isOpen = false} />
<NotificationModal isOpen={drawModal.isOpen} title={drawModal.title} message={drawModal.message} type="confirm" onConfirm={drawModal.onConfirm} onClose={() => drawModal.isOpen = false} onCancel={() => drawModal.isOpen = false} />

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

<script>
	let {
		match,
		index,
		level,
		gender,
		isComplete = false,
		score = null,
		onInputScore
	} = $props();

	// Use actual match data instead of hardcoded calculations
	let day = $derived(match.day);
	let time = $derived(match.time);
	let round = $derived(match.round || '16 Besar');
	let matchStrId = $derived(match.matchStrId || `M${String(index + 1).padStart(2, '0')}`);
</script>

<div class="bg-white/95 backdrop-blur-sm rounded-xl border border-neutral-200/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow {isComplete ? 'ring-2 ring-green-500/50' : ''}">
	<!-- Header -->
	<div class="bg-linear-to-r from-indigo-50 to-white px-4 py-3 border-b border-neutral-100">
		<div class="flex items-center justify-between mb-2">
			<div class="flex items-center gap-2">
				<span class="font-montserrat font-bold text-base text-indigo-600">MATCH {matchStrId}</span>
				{#if isComplete}
					<span class="bg-green-100 text-green-700 border border-green-200 text-[10px] px-2 py-0.5 rounded font-poppins font-semibold flex items-center gap-1">
						<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
						Complete
					</span>
				{/if}
			</div>
			<span class="text-xs font-poppins font-medium text-neutral-400">{round}</span>
		</div>
		<div class="flex items-center gap-2 flex-wrap">
			<div class="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-neutral-200">
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
				<span class="text-xs font-poppins font-semibold text-neutral-700">Day {day}</span>
			</div>
			<div class="flex items-center gap-1.5 bg-indigo-600 px-2.5 py-1 rounded-md">
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
				<span class="text-xs font-poppins font-semibold text-white">{time} WIB</span>
			</div>
		</div>
	</div>
	
	<!-- Teams -->
	<div class="p-5 space-y-3 relative">
		<!-- VS Badge -->
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center text-xs font-montserrat font-black text-indigo-600 z-10 shadow-sm">VS</div>
		
		<!-- Team 1 -->
		<div class="flex items-center gap-3 rounded-lg border-2 border-indigo-600 bg-linear-to-r from-indigo-50 to-white p-3.5 hover:shadow-sm transition-shadow">
			<div class="w-1.5 h-10 rounded-full bg-indigo-600 shadow-sm"></div>
			<div class="flex-1 min-w-0">
				<div class="text-[10px] font-poppins font-medium text-indigo-600 mb-0.5 uppercase tracking-wide">Team 1</div>
				<div class="text-sm font-poppins font-semibold {match.team1 === '?' || match.team1 === 'TBD' ? 'text-neutral-300 italic' : 'text-neutral-900'} truncate">{match.team1}</div>
			</div>
			{#if isComplete && score}
				<div class="text-2xl font-montserrat font-black text-indigo-600">{score.score1}</div>
			{/if}
		</div>
		
		<!-- Team 2 -->
		<div class="flex items-center gap-3 rounded-lg border-2 border-neutral-200 bg-neutral-50 p-3.5 hover:shadow-sm transition-shadow">
			<div class="w-1.5 h-10 rounded-full bg-red-500 shadow-sm"></div>
			<div class="flex-1 min-w-0">
				<div class="text-[10px] font-poppins font-medium text-neutral-500 mb-0.5 uppercase tracking-wide">Team 2</div>
				<div class="text-sm font-poppins font-semibold {match.team2 === '?' || match.team2 === 'TBD' ? 'text-neutral-300 italic' : 'text-neutral-900'} truncate">{match.team2}</div>
			</div>
			{#if isComplete && score}
				<div class="text-2xl font-montserrat font-black text-neutral-600">{score.score2}</div>
			{/if}
		</div>
	</div>
	
	<!-- Action Button -->
	{#if onInputScore}
		<div class="px-5 pb-5">
			<button onclick={onInputScore} class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-poppins font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					{#if isComplete}
						<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
					{:else}
						<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
					{/if}
				</svg>
				{isComplete ? 'Edit Score' : 'Input Score'}
			</button>
		</div>
	{/if}
</div>

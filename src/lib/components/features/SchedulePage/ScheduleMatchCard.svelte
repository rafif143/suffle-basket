<script>
	let {
		match,
		isComplete = false,
		score = null,
		onInputScore
	} = $props();
	
	const isTBD = (team) => team === 'TBD' || team?.includes('Winner');
</script>

<div class="bg-white/95 backdrop-blur-sm rounded-xl border border-neutral-200/50 shadow-sm overflow-hidden hover:shadow-md transition-all {isComplete ? 'ring-2 ring-green-500/50 bg-green-50/30' : ''}">
	<!-- Header -->
	<div class="bg-linear-to-r from-indigo-50 to-white px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span class="font-montserrat font-bold text-sm text-indigo-600">{match.round === 'Final' ? 'FINAL' : `M${String(match.match_number).padStart(2, '0')}`}</span>
			<span class="text-[10px] font-poppins font-medium text-neutral-400">{match.round}</span>
		</div>
		<div class="flex items-center gap-1.5">
			<span class="text-[10px] font-poppins font-bold px-2 py-0.5 rounded {match.category.includes('SMA') ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}">{match.category}</span>
			{#if isComplete}
				<span class="bg-green-100 text-green-700 border border-green-200 text-[10px] px-2 py-0.5 rounded font-poppins font-semibold flex items-center gap-1">
					<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
					Done
				</span>
			{/if}
		</div>
	</div>
	
	<!-- Time -->
	<div class="px-4 py-2 border-b border-neutral-100 flex items-center gap-1.5 text-xs text-neutral-600">
		<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
		{match.match_time} WIB
	</div>
	
	<!-- Teams -->
	<div class="p-4 space-y-2 relative">
		<!-- VS Badge -->
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-neutral-200 rounded-full flex items-center justify-center text-[10px] font-montserrat font-black text-neutral-400 z-10 shadow-sm">VS</div>
		
		<!-- Team 1 (Home) -->
		<div class="flex items-center gap-2.5 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-3 hover:shadow-sm transition-shadow">
			<div class="flex-1 min-w-0">
				<div class="text-[9px] font-poppins font-semibold text-indigo-600 mb-0.5 uppercase tracking-wide">Home</div>
				<div class="text-sm font-poppins font-semibold {isTBD(match.team1) ? 'text-neutral-300 italic' : 'text-neutral-900'} truncate">{match.team1}</div>
			</div>
			{#if isComplete && score}
				<div class="text-2xl font-montserrat font-black text-indigo-600">{score.score1}</div>
			{/if}
		</div>
		
		<!-- Team 2 (Away) -->
		<div class="flex items-center gap-2.5 rounded-lg border-2 border-neutral-200 bg-neutral-50 p-3 hover:shadow-sm transition-shadow">
			<div class="flex-1 min-w-0">
				<div class="text-[9px] font-poppins font-semibold text-neutral-500 mb-0.5 uppercase tracking-wide">Away</div>
				<div class="text-sm font-poppins font-semibold {isTBD(match.team2) ? 'text-neutral-300 italic' : 'text-neutral-900'} truncate">{match.team2}</div>
			</div>
			{#if isComplete && score}
				<div class="text-2xl font-montserrat font-black text-neutral-600">{score.score2}</div>
			{/if}
		</div>
	</div>
	
	<!-- Action Button -->
	<div class="px-4 pb-4">
		<button 
			onclick={onInputScore} 
			class="w-full py-2.5 rounded-lg font-poppins font-semibold text-sm transition-all flex items-center justify-center gap-2 {isComplete ? 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'}"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				{#if isComplete}
					<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
				{:else}
					<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
				{/if}
			</svg>
			{isComplete ? 'Edit Score' : 'Input Score'}
		</button>
	</div>
</div>

<script>
	let {
		match,
		index,
		level,
		gender,
		isComplete = false,
		score = null,
		onInputScore,
		logo1 = null,
		logo2 = null
	} = $props();

	// Use actual match data instead of hardcoded calculations
	let day = $derived(match.day);
	let time = $derived(match.time);
	let round = $derived(match.round || '16 Besar');
	let matchStrId = $derived(match.matchStrId || `M${String(index + 1).padStart(2, '0')}`);

	// Determine if match is "LIVE"
	// For simplicity, if it has scores but not complete, it's live
	// Or we could check time, but score updates are more reliable for "live" status
	let isLive = $derived(!isComplete && score && (score.score1 > 0 || score.score2 > 0));
</script>

<div class="group relative bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 {isComplete ? 'ring-2 ring-green-500/30' : ''} {isLive ? 'ring-2 ring-red-500/30' : ''}">
	<!-- Status Bar -->
	{#if isLive}
		<div class="h-1 w-full bg-linear-to-r from-red-500 via-red-400 to-red-500 bg-[length:200%_auto] animate-gradient-x"></div>
	{:else if isComplete}
		<div class="h-1 w-full bg-green-500"></div>
	{:else}
		<div class="h-1 w-full bg-indigo-600/20"></div>
	{/if}

	<!-- Header -->
	<div class="bg-linear-to-r from-indigo-50/80 to-white/80 px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<span class="font-montserrat font-black text-sm text-indigo-900 tracking-tight">#{matchStrId}</span>
			{#if isLive}
				<div class="flex items-center gap-1.5 px-2 py-0.5 bg-red-500 rounded-full">
					<span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
					<span class="text-[10px] font-montserrat font-black text-white uppercase tracking-tighter">LIVE</span>
				</div>
			{:else if isComplete}
				<div class="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200">
					<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
					<span class="text-[10px] font-montserrat font-black uppercase tracking-tighter">FINAL</span>
				</div>
			{/if}
		</div>
		<span class="text-[10px] font-poppins font-black text-neutral-400 uppercase tracking-widest">{round}</span>
	</div>
	
	<!-- Match Info Grid -->
	<div class="p-5">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 relative">
			<!-- Team 1 -->
			<div class="flex flex-col items-center text-center gap-3">
				<div class="w-14 h-14 bg-white border border-indigo-100 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform overflow-hidden">
					{#if logo1}
						<img src={logo1} alt="Logo" class="w-full h-full object-contain p-1" />
					{:else}
						<div class="text-indigo-600">
							<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12 3 9l3-3"/><path d="M18 18 21 15l-3-3"/><path d="M3 9h18"/><path d="M21 15H3"/></svg>
						</div>
					{/if}
				</div>
				<div class="space-y-1">
					<div class="text-[9px] font-poppins font-black text-indigo-400 uppercase tracking-[0.2em]">Home</div>
					<div class="text-sm font-poppins font-bold {match.team1 === '?' || match.team1 === 'TBD' ? 'text-neutral-300 italic' : 'text-neutral-900'} line-clamp-2 leading-tight min-h-[2.5rem] flex items-center justify-center">
						{match.team1}
					</div>
				</div>
				{#if score}
					<div class="text-4xl font-montserrat font-black text-indigo-900 tabular-nums">{score.score1}</div>
				{:else}
					<div class="text-4xl font-montserrat font-black text-neutral-100 tabular-nums">0</div>
				{/if}
			</div>

			<!-- Divider / VS -->
			<div class="flex flex-col items-center gap-4 self-start mt-4">
				<div class="px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200 text-[9px] font-black text-neutral-400 tracking-tighter">VS</div>
				<div class="w-px h-24 bg-linear-to-b from-neutral-200 to-transparent"></div>
			</div>

			<!-- Team 2 -->
			<div class="flex flex-col items-center text-center gap-3">
				<div class="w-14 h-14 bg-white border border-red-100 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform overflow-hidden">
					{#if logo2}
						<img src={logo2} alt="Logo" class="w-full h-full object-contain p-1" />
					{:else}
						<div class="text-red-500">
							<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12 3 9l3-3"/><path d="M18 18 21 15l-3-3"/><path d="M3 9h18"/><path d="M21 15H3"/></svg>
						</div>
					{/if}
				</div>
				<div class="space-y-1">
					<div class="text-[9px] font-poppins font-black text-red-400 uppercase tracking-[0.2em]">Away</div>
					<div class="text-sm font-poppins font-bold {match.team2 === '?' || match.team2 === 'TBD' ? 'text-neutral-300 italic' : 'text-neutral-900'} line-clamp-2 leading-tight min-h-[2.5rem] flex items-center justify-center">
						{match.team2}
					</div>
				</div>
				{#if score}
					<div class="text-4xl font-montserrat font-black text-indigo-900 tabular-nums">{score.score2}</div>
				{:else}
					<div class="text-4xl font-montserrat font-black text-neutral-100 tabular-nums">0</div>
				{/if}
			</div>
		</div>

		<!-- Match Meta -->
		<div class="mt-8 flex items-center justify-center gap-2">
			<div class="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-100">
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
				<span class="text-[10px] font-poppins font-bold text-neutral-500 uppercase">Day {day}</span>
			</div>
			<div class="flex items-center gap-1.5 bg-indigo-600 px-3 py-1.5 rounded-full shadow-lg shadow-indigo-600/20">
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
				<span class="text-[10px] font-poppins font-black text-white uppercase">{time} WIB</span>
			</div>
		</div>
	</div>
	
	<!-- Action Button -->
	{#if onInputScore}
		<div class="px-5 pb-5 mt-2">
			<button onclick={onInputScore} class="w-full py-3 bg-indigo-900 hover:bg-black text-white font-poppins font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/10">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					{#if isComplete}
						<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
					{:else}
						<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
					{/if}
				</svg>
				{isComplete ? 'Edit Final Score' : 'Update Live Score'}
			</button>
		</div>
	{/if}
</div>

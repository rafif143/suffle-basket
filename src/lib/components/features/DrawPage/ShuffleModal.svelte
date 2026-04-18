<script>
	let {
		isOpen = false,
		isShuffling = false,
		team1 = '???',
		team2 = '???',
		logo1 = null,
		logo2 = null,
		category = '',
		day = 1,
		time = '',
		matchIndex = -1,
		onStart = null,
		onNext = null,
		onBackToMenu = null
	} = $props();
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/95 backdrop-blur-sm">
		<div class="flex w-full max-w-6xl flex-col items-center justify-center px-4 text-center">
			<h1 class="mb-8 font-montserrat text-5xl font-black text-white">Yadika Cup - Basketball Drawing</h1>
			
			<div class="mb-8 flex flex-wrap items-center justify-center gap-4">
				<span class="rounded-full border border-neutral-700 bg-neutral-900 px-8 py-3 text-lg font-poppins font-semibold text-white">{category}</span>
				<span class="rounded-full border border-indigo-500 bg-indigo-600 px-10 py-3 text-xl font-poppins font-bold text-white shadow-xl shadow-indigo-500/30">DAY {day}</span>
				<span class="rounded-full border border-blue-500 bg-blue-600 px-10 py-3 text-xl font-poppins font-bold text-white shadow-xl shadow-blue-500/30">{time} WIB</span>
			</div>

			<h2 class="mb-12 font-montserrat text-3xl font-bold {isShuffling ? 'animate-pulse text-indigo-400' : 'text-white'}">
				{#if isShuffling}
					Drawing Match {matchIndex + 1}...
				{:else if team1 === '???'}
					Ready to draw Match {matchIndex + 1}
				{:else}
					Match {matchIndex + 1} Confirmed!
				{/if}
			</h2>

			<div class="flex w-full flex-col items-center justify-center gap-12 md:flex-row">
				<!-- Team 1 -->
				<div class="flex flex-col items-center gap-6 w-full md:w-5/12">
					<div class="relative group flex h-72 w-full items-center justify-center rounded-[3rem] border-2 transition-all duration-700 {isShuffling ? 'border-neutral-800 bg-neutral-900/50 grayscale' : 'border-indigo-500 bg-white/10 shadow-[0_0_50px_rgba(79,70,229,0.3)]'}">
						{#if logo1}
							<img src={logo1} alt="Logo" class="max-h-[60%] max-w-[60%] object-contain transition-transform duration-500 {isShuffling ? 'scale-90 animate-pulse' : 'scale-110'}" />
						{:else}
							<div class="text-8xl font-black text-neutral-800">?</div>
						{/if}
						
						{#if !isShuffling && team1 !== '???'}
							<div class="absolute -top-4 -right-4 bg-indigo-600 text-white rounded-full p-2 shadow-lg animate-bounce">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
							</div>
						{/if}
					</div>
					<h3 class="font-montserrat text-4xl font-black uppercase tracking-tight {isShuffling ? 'text-neutral-700' : 'text-white'}">{team1}</h3>
				</div>

				<!-- VS -->
				<div class="relative">
					<div class="font-montserrat text-7xl font-black italic tracking-tighter {isShuffling ? 'text-neutral-800' : 'text-transparent bg-clip-text bg-linear-to-b from-indigo-400 to-indigo-600'}">VS</div>
				</div>

				<!-- Team 2 -->
				<div class="flex flex-col items-center gap-6 w-full md:w-5/12">
					<div class="relative group flex h-72 w-full items-center justify-center rounded-[3rem] border-2 transition-all duration-700 {isShuffling ? 'border-neutral-800 bg-neutral-900/50 grayscale' : 'border-indigo-500 bg-white/10 shadow-[0_0_50px_rgba(79,70,229,0.3)]'}">
						{#if logo2}
							<img src={logo2} alt="Logo" class="max-h-[60%] max-w-[60%] object-contain transition-transform duration-500 {isShuffling ? 'scale-90 animate-pulse' : 'scale-110'}" />
						{:else}
							<div class="text-8xl font-black text-neutral-800">?</div>
						{/if}

						{#if !isShuffling && team2 !== '???'}
							<div class="absolute -top-4 -right-4 bg-indigo-600 text-white rounded-full p-2 shadow-lg animate-bounce" style="animation-delay: 0.2s">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
							</div>
						{/if}
					</div>
					<h3 class="font-montserrat text-4xl font-black uppercase tracking-tight {isShuffling ? 'text-neutral-700' : 'text-white'}">{team2}</h3>
				</div>
			</div>

			{#if !isShuffling}
				<div class="mt-16 flex items-center justify-center gap-6">
					{#if team1 === '???'}
						<button onclick={onStart} class="rounded-xl bg-indigo-600 px-12 py-5 text-lg font-poppins font-bold text-white shadow-xl shadow-indigo-500/40 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all">START DRAW</button>
					{:else if onNext}
						<button onclick={onNext} class="rounded-xl bg-indigo-600 px-8 py-4 text-sm font-poppins font-semibold text-white shadow-lg hover:bg-neutral-900 transition-all">Next Shuffle</button>
					{/if}
					
					{#if onBackToMenu}
						<button onclick={onBackToMenu} class="rounded-xl border border-neutral-800 bg-neutral-900 px-8 py-4 text-sm font-poppins font-medium text-neutral-400 hover:bg-neutral-800 transition-all">Back to Menu</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

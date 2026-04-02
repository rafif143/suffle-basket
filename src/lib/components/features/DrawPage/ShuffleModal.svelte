<script>
	let {
		isOpen = false,
		isShuffling = false,
		team1 = '???',
		team2 = '???',
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
				<div class="flex h-64 w-full items-center justify-center rounded-3xl border-2 p-6 md:w-5/12 {isShuffling ? 'border-neutral-800 bg-white/5' : 'border-indigo-500 bg-white/10 shadow-2xl shadow-indigo-500/20'}">
					<h3 class="text-center font-poppins text-4xl font-bold {isShuffling ? 'text-neutral-700' : 'text-white'}">{team1}</h3>
				</div>

				<div class="z-10 font-montserrat text-6xl font-black {isShuffling ? 'text-neutral-800' : 'text-indigo-400'}">VS</div>

				<div class="flex h-64 w-full items-center justify-center rounded-3xl border-2 p-6 md:w-5/12 {isShuffling ? 'border-neutral-800 bg-white/5' : 'border-indigo-500 bg-white/10 shadow-2xl shadow-indigo-500/20'}">
					<h3 class="text-center font-poppins text-4xl font-bold {isShuffling ? 'text-neutral-700' : 'text-white'}">{team2}</h3>
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

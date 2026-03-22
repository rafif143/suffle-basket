<script>
	let {
		isOpen = false,
		match = null,
		score1 = $bindable(''),
		score2 = $bindable(''),
		onClose,
		onSave
	} = $props();
</script>

{#if isOpen && match}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm" onclick={onClose}>
		<div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onclick={e => e.stopPropagation()}>
			<div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="font-montserrat font-bold text-xl text-white">Input Score</h3>
						<p class="font-poppins text-sm text-indigo-100 mt-0.5">{match.round === 'Grand Final' ? `Final ${match.category}` : `Match ${match.matchStrId}`} - {match.category}</p>
					</div>
					<button onclick={onClose} class="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors" aria-label="Close">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
					</button>
				</div>
			</div>
			
			<div class="p-6 space-y-4">
				<div class="space-y-2">
					<label class="flex items-center gap-2 text-sm font-poppins font-semibold text-neutral-700">
						<div class="w-1 h-4 rounded-full bg-indigo-600"></div>
						{match.team1}
					</label>
					<input 
						type="number" 
						bind:value={score1}
						min="0"
						class="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-montserrat font-bold text-2xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
						placeholder="0"
					/>
				</div>
				
				<div class="flex items-center justify-center">
					<div class="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
						<span class="font-montserrat font-black text-neutral-400">VS</span>
					</div>
				</div>
				
				<div class="space-y-2">
					<label class="flex items-center gap-2 text-sm font-poppins font-semibold text-neutral-700">
						<div class="w-1 h-4 rounded-full bg-red-500"></div>
						{match.team2}
					</label>
					<input 
						type="number" 
						bind:value={score2}
						min="0"
						class="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-montserrat font-bold text-2xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
						placeholder="0"
					/>
				</div>
			</div>
			
			<div class="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex gap-3">
				<button onclick={onClose} class="flex-1 py-3 bg-white border border-neutral-200 text-neutral-600 font-poppins font-semibold rounded-xl hover:bg-neutral-50 transition-colors">
					Cancel
				</button>
				<button onclick={onSave} class="flex-1 py-3 bg-indigo-600 text-white font-poppins font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
					Save Score
				</button>
			</div>
		</div>
	</div>
{/if}

<script>
	import { MATCHES_PER_CATEGORY } from '$lib/constants/draw';

	let { 
		currentMatchIndex = -1,
		isShuffling = false,
		completedMatches = 0,
		onShuffle = null,
		onGeneratePDF = null
	} = $props();
</script>

<div class="space-y-4">
	<!-- Action Buttons -->
	<div class="flex flex-wrap gap-3">
		<button
			onclick={onShuffle}
			disabled={isShuffling || currentMatchIndex === -1}
			class="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-poppins text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
				<path d="m9 11 3 3L22 4" />
			</svg>
			{isShuffling ? 'Shuffling...' : 'Shuffle'}
		</button>

		<button
			onclick={onGeneratePDF}
			class="flex items-center gap-2 rounded-xl border-2 border-neutral-200 bg-white px-6 py-3 font-poppins text-sm font-bold text-neutral-600 transition-all hover:bg-neutral-50 hover:border-neutral-300"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
				<polyline points="14 2 14 8 20 8" />
				<line x1="16" x2="8" y1="13" y2="13" />
				<line x1="16" x2="8" y1="17" y2="17" />
				<line x1="10" x2="8" y1="9" y2="9" />
			</svg>
			Export PDF
		</button>
	</div>
</div>

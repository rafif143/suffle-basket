<script>
	import { jsPDF } from "jspdf";
	import autoTable from "jspdf-autotable";
	import { getMatchDay, getMatchTime, getMatchIndexInDay } from '$lib/utils';
	
	let {
		currentMatchIndex,
		isShuffling,
		onShuffle,
		onReset,
		onGeneratePDF
	} = $props();
</script>

<div class="bg-white/90 backdrop-blur-sm rounded-xl border border-neutral-200/50 p-6 shadow-sm">
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
		<div>
			<h3 class="font-montserrat font-bold text-2xl text-neutral-900">
				{#if currentMatchIndex === -1}
					Draw Complete
				{:else}
					Execute Draw: Match {currentMatchIndex + 1}
				{/if}
			</h3>
			<p class="font-poppins text-sm text-neutral-500 mt-1">
				{#if currentMatchIndex === -1}
					All matches generated successfully
				{:else}
					Shuffle remaining teams for next match
				{/if}
			</p>
		</div>

		{#if currentMatchIndex === -1}
			<div class="flex gap-3">
				<button onclick={onGeneratePDF} class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-poppins font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
					PDF
				</button>
				<button onclick={onReset} class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-poppins font-medium text-sm hover:bg-red-100 transition-colors">
					Reset
				</button>
			</div>
		{:else}
			<button
				onclick={onShuffle}
				disabled={isShuffling}
				class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-poppins font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
			>
				{#if isShuffling}
					<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Shuffling...
				{:else}
					Draw Match {currentMatchIndex + 1}
				{/if}
			</button>
		{/if}
	</div>
</div>

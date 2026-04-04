<script>
	let { 
		isOpen = false, 
		title = 'Processing Test Data', 
		logs = [], 
		isComplete = false, 
		onClose = null 
	} = $props();

	let logContainer = $state(null);

	// Auto-scroll to bottom of logs
	$effect(() => {
		if (logs.length && logContainer) {
			logContainer.scrollTop = logContainer.scrollHeight;
		}
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-md px-4">
		<div class="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[80vh]">
			<!-- Header -->
			<div class="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
				<div class="flex items-center gap-4">
					{#if !isComplete}
						<div class="relative flex h-3 w-3">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
							<span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
						</div>
					{:else}
						<div class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>
						</div>
					{/if}
					<div>
						<h3 class="font-montserrat text-xl font-black text-neutral-900">{title}</h3>
						<p class="text-xs font-medium text-neutral-400 uppercase tracking-widest mt-0.5">
							{isComplete ? 'Process Finished' : 'Automated Test in Progress'}
						</p>
					</div>
				</div>
				
				{#if isComplete}
					<button 
						onclick={onClose}
						class="text-neutral-400 hover:text-neutral-900 transition-colors p-2 hover:bg-neutral-100 rounded-full"
						aria-label="Close modal"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
				{/if}
			</div>

			<!-- Logs Content -->
			<div 
				bind:this={logContainer}
				class="flex-1 overflow-y-auto p-6 bg-neutral-900 font-mono text-sm space-y-2 min-h-[300px]"
			>
				{#if logs.length === 0}
					<div class="flex flex-col items-center justify-center h-full text-neutral-500 py-12">
						<svg class="h-8 w-8 animate-spin mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<p>Initializing test sequencer...</p>
					</div>
				{/if}

				{#each logs as log, i}
					<div 
						class="flex gap-3 leading-relaxed animate-in fade-in slide-in-from-left-2 duration-300"
						style="animation-delay: {i * 50}ms"
					>
						<span class="text-neutral-600 select-none">[{i + 1}]</span>
						<span class={
							log.includes('❌') ? 'text-rose-400' : 
							log.includes('✅') ? 'text-emerald-400 font-bold' : 
							log.includes('Scoring') ? 'text-indigo-300' : 
							'text-neutral-300'
						}>
							{log}
						</span>
					</div>
				{/each}
			</div>

			<!-- Footer -->
			<div class="px-8 py-5 border-t border-neutral-100 bg-neutral-50 flex justify-between items-center">
				<div class="flex items-center gap-2">
					<div class="flex -space-x-2">
						<div class="h-6 w-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600">JS</div>
						<div class="h-6 w-6 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-purple-600">API</div>
					</div>
					<span class="text-[11px] font-bold text-neutral-400 uppercase tracking-tighter">System Diagnostics</span>
				</div>
				
				{#if isComplete}
					<button 
						onclick={onClose}
						class="px-6 py-2.5 bg-indigo-600 text-white font-poppins font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform active:scale-95"
					>
						Done
					</button>
				{:else}
					<div class="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl">
						<div class="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></div>
						<span class="text-xs font-bold text-indigo-600 font-poppins">Running...</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

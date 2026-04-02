<script>
	let {
		player,
		index,
		canRemove = false,
		onCardChange,
		onRemoveCard,
		onRemove
	} = $props();
</script>

<div class="flex items-center gap-2.5 px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl transition-all focus-within:border-indigo-300 focus-within:bg-white">
	<span class="w-6 text-center font-montserrat text-xs font-extrabold text-neutral-300 flex-shrink-0">{index + 1}</span>
	
	<input
		type="text"
		bind:value={player.name}
		required
		placeholder="Full player name"
		class="flex-1 bg-transparent border-none font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none min-w-0"
	/>
	
	<div class="flex items-center gap-1.5 flex-shrink-0">
		{#if player.card}
			<div class="flex items-center gap-1 bg-green-100 text-green-700 font-poppins text-[11px] font-bold px-2.5 py-1 rounded-lg">
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
				ID Uploaded
				<button type="button" onclick={onRemoveCard} class="ml-1 text-green-300 hover:text-red-500 transition-colors" aria-label="Remove ID card">
					<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
				</button>
			</div>
		{:else}
			<label class="flex items-center gap-1 bg-white border-2 border-neutral-200 text-neutral-600 font-poppins text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:border-indigo-300 hover:text-indigo-600 transition-colors" aria-label="Upload player ID card">
				<input type="file" accept="image/*" required onchange={onCardChange} class="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style="clip: rect(0, 0, 0, 0);" aria-label="Player ID card file input" />
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
				Upload ID
			</label>
		{/if}
		
		{#if canRemove}
			<button type="button" onclick={onRemove} class="p-1 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label="Remove player">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
			</button>
		{/if}
	</div>
</div>

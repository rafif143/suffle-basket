<script>
	let {
		isOpen = false,
		onClose,
		title = '',
		children
	} = $props();
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm"
		onclick={onClose}
	>
		<div 
			class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
			onclick={e => e.stopPropagation()}
		>
			{#if title}
				<div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
					<h3 class="font-montserrat font-bold text-xl text-neutral-900">{title}</h3>
					<button 
						onclick={onClose}
						class="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
						aria-label="Close"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
					</button>
				</div>
			{/if}
			
			<div class="p-6">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<script>
	let {
		isOpen = false,
		isProcessing = false,
		title = '',
		message = '',
		onConfirm = null,
		onCancel = null
	} = $props();
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 backdrop-blur-sm">
		<div class="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-2xl">
			<h3 class="mb-3 font-montserrat text-xl font-bold text-neutral-900">{title}</h3>
			<p class="mb-6 text-sm leading-relaxed text-neutral-600">{message}</p>

			{#if isProcessing}
				<div class="flex items-center justify-center gap-3 py-4">
					<svg class="h-5 w-5 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<span class="text-sm font-medium text-neutral-600">Processing...</span>
				</div>
			{:else}
				<div class="flex gap-3">
					<button onclick={onCancel} class="flex-1 rounded-lg bg-neutral-100 py-2.5 font-poppins text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-200">Cancel</button>
					<button onclick={onConfirm} class="flex-1 rounded-lg bg-indigo-600 py-2.5 font-poppins text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700">Confirm</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

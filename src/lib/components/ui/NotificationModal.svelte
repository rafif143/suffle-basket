<script>
	let { isOpen = false, title = 'Notification', message = '', type = 'alert', onConfirm, onCancel, onClose } = $props();

	function handleConfirm() {
		if (onConfirm) onConfirm();
		close();
	}

	function handleCancel() {
		if (onCancel) onCancel();
		close();
	}

	function close() {
		if (onClose) onClose();
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm" onclick={close}>
		<div class="bg-white border border-neutral-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onclick={e => e.stopPropagation()}>
			<div class="p-8 text-center">
				<div class="w-16 h-16 {type === 'confirm' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'} rounded-full flex items-center justify-center mx-auto mb-6">
					{#if type === 'confirm'}
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
					{/if}
				</div>
				<h3 class="font-montserrat font-bold text-2xl text-neutral-900 mb-4">{title}</h3>
				<p class="text-neutral-500 font-poppins leading-relaxed text-sm mb-8">{message}</p>
				<div class="flex flex-col sm:flex-row gap-3">
					{#if type === 'confirm'}
						<button onclick={handleCancel} class="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-poppins font-semibold rounded-lg transition-all text-sm">Cancel</button>
						<button onclick={handleConfirm} class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-poppins font-semibold rounded-lg transition-all text-sm shadow-lg shadow-indigo-100">Confirm</button>
					{:else}
						<button onclick={handleConfirm} class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-poppins font-semibold rounded-lg transition-all text-sm shadow-lg shadow-indigo-100">Understood</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

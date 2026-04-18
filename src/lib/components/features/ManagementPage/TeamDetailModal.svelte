<script>
	let {
		team = null,
		onClose,
		onUpdateStatus,
		onDelete
	} = $props();

	let deleteModal = $state({
		isOpen: false
	});

	let previewImage = $state(null);
</script>

{#if team}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-5" onclick={onClose}>
		<div class="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" onclick={e => e.stopPropagation()}>
			
			<!-- Header -->
			<div class="bg-linear-to-r from-indigo-50 to-white px-6 py-5 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
				<div class="flex items-center gap-3.5">
					<button 
						onclick={() => previewImage = team.logo}
						disabled={!team.logo}
						class="w-12 h-12 bg-white border border-neutral-200 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 overflow-hidden hover:scale-105 active:scale-95 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if team.logo}
							<img src={team.logo} alt="Logo" class="w-full h-full object-contain p-1" />
						{:else}
							<div class="w-full h-full bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
							</div>
						{/if}
						<div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
						</div>
					</button>
					<div>
						<div class="flex items-center gap-2">
							<h3 class="font-montserrat text-xl font-black text-neutral-900">{team.school}</h3>
							{#if team.logo}
								<button onclick={() => previewImage = team.logo} class="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 underline decoration-2 underline-offset-2 transition-colors">Lihat Logo</button>
							{/if}
						</div>
						<p class="text-xs text-neutral-500 font-medium mt-0.5">{team.id} · {team.level} {team.gender}</p>
					</div>
				</div>
				<button onclick={onClose} class="w-8 h-8 rounded-xl border-2 border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-600 transition-colors" aria-label="Close">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
				</button>
			</div>

			<!-- Body -->
			<div class="flex-1 overflow-y-auto p-6">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					
					<!-- Left Column -->
					<div class="space-y-5">
						<div>
							<h4 class="font-montserrat text-[11px] font-extrabold text-neutral-400 uppercase tracking-wide mb-3">Contact & Location</h4>
							<div class="space-y-2.5">
								<div class="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
									<p class="text-[10px] font-poppins font-bold text-neutral-400 uppercase tracking-wide mb-1">WhatsApp</p>
									<p class="text-base font-poppins font-bold text-neutral-900">+62 {team.whatsapp}</p>
								</div>
								<div class="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
									<p class="text-[10px] font-poppins font-bold text-neutral-400 uppercase tracking-wide mb-1">Address</p>
									<p class="text-sm font-poppins font-medium text-neutral-700 leading-relaxed">{team.address}</p>
								</div>
							</div>
						</div>

						<div>
							<h4 class="font-montserrat text-[11px] font-extrabold text-neutral-400 uppercase tracking-wide mb-3">Team Officials</h4>
							<div class="grid grid-cols-2 gap-2">
								{#each team.officials as official}
									<div class="bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm font-poppins font-semibold text-neutral-700">{official}</div>
								{/each}
							</div>
						</div>
					</div>

					<!-- Right Column -->
					<div>
						<h4 class="font-montserrat text-[11px] font-extrabold text-neutral-400 uppercase tracking-wide mb-3">Players · {team.players.length} registered</h4>
						<div class="bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden">
							{#each team.players as player, i}
								<div class="flex items-center gap-2.5 px-3.5 py-3 border-b border-neutral-200 last:border-b-0 hover:bg-white transition-colors">
									<span class="w-5 text-right font-montserrat text-xs font-extrabold text-neutral-300">{i + 1}</span>
									<span class="flex-1 text-sm font-poppins font-semibold text-neutral-900">{player.name}</span>
									<button 
										onclick={() => previewImage = player.card_url}
										disabled={!player.card_url}
										class="flex items-center gap-1 bg-indigo-100 border border-indigo-200 text-indigo-600 font-poppins text-[11px] font-bold px-2.5 py-1 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
										View ID
									</button>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
				<div class="flex items-center gap-2.5">
					<span class="text-xs font-poppins font-semibold text-neutral-500">Current status</span>
					{#if team.status === 'Pending'}
						<span class="bg-amber-100 text-amber-700 border border-amber-200 text-[11px] px-3 py-1 rounded-full font-poppins font-bold">Pending</span>
					{:else if team.status === 'Verified'}
						<span class="bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] px-3 py-1 rounded-full font-poppins font-bold">Verified</span>
					{:else}
						<span class="bg-rose-100 text-rose-700 border border-rose-200 text-[11px] px-3 py-1 rounded-full font-poppins font-bold">Rejected</span>
					{/if}
				</div>
				<div class="flex gap-2">
					<button 
						onclick={() => deleteModal.isOpen = true} 
						class="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 border-2 border-red-200 text-red-700 font-poppins font-bold text-sm rounded-xl hover:bg-red-100 transition-colors"
						title="Delete registration"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
						Delete
					</button>
					<button onclick={() => onUpdateStatus(team.id, 'Rejected')} class="flex items-center gap-1.5 px-5 py-2.5 bg-rose-50 border-2 border-rose-200 text-rose-700 font-poppins font-bold text-sm rounded-xl hover:bg-rose-100 transition-colors">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
						Reject
					</button>
					<button onclick={() => onUpdateStatus(team.id, 'Verified')} class="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-poppins font-bold text-sm rounded-xl transition-colors shadow-lg shadow-indigo-200">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
						Verify & Approve
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Delete Confirmation Modal -->
	{#if deleteModal.isOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-[60] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-5" onclick={() => deleteModal.isOpen = false}>
			<div class="bg-white rounded-2xl border border-neutral-200 p-8 max-w-md w-full mx-4 shadow-2xl" onclick={e => e.stopPropagation()}>
				<div class="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
				</div>
				<h3 class="font-montserrat text-xl font-bold text-neutral-900 mb-3 text-center">Delete Registration?</h3>
				<p class="text-sm text-neutral-600 leading-relaxed mb-6 text-center">
					Are you sure you want to delete <span class="font-bold text-neutral-900">{team.school}</span>? This action cannot be undone and will permanently remove all team data.
				</p>
				
				<div class="flex gap-3">
					<button
						onclick={() => deleteModal.isOpen = false}
						class="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-poppins font-semibold text-sm rounded-lg transition-colors"
					>
						Cancel
					</button>
					<button
						onclick={() => {
							onDelete(team.id);
							deleteModal.isOpen = false;
						}}
						class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-poppins font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-red-200"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- ID Card Preview Modal -->
	{#if previewImage}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			class="fixed inset-0 z-[70] bg-neutral-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300" 
			onclick={() => previewImage = null}
		>
			<!-- Close Button (Absolute to viewport) -->
			<button 
				onclick={(e) => { e.stopPropagation(); previewImage = null; }}
				class="absolute top-6 right-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-95 text-white rounded-full flex items-center justify-center transition-all border border-white/20 backdrop-blur-md shadow-2xl"
				aria-label="Close preview"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
			</button>

			<div class="relative max-w-5xl w-full h-full flex flex-col items-center justify-center" onclick={e => e.stopPropagation()}>
				<div class="w-full h-full bg-neutral-900/50 rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl shadow-black/50">
					<img src={previewImage} alt="ID Card Preview" class="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-500 shadow-2xl" />
				</div>
				
				<div class="mt-8 flex items-center gap-4">
					<p class="font-montserrat text-sm font-black text-white/40 uppercase tracking-[.25em]">
						Student Identification Document
					</p>
					<div class="h-px w-12 bg-white/20"></div>
					<a href={previewImage} target="_blank" class="text-indigo-400 hover:text-indigo-300 font-poppins text-xs font-bold underline decoration-2 underline-offset-4 transition-colors">
						Open Original
					</a>
				</div>
			</div>
		</div>
	{/if}
{/if}

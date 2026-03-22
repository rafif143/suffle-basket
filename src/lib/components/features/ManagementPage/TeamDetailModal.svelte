<script>
	let {
		team = null,
		onClose,
		onUpdateStatus
	} = $props();
</script>

{#if team}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-5" onclick={onClose}>
		<div class="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" onclick={e => e.stopPropagation()}>
			
			<!-- Header -->
			<div class="bg-linear-to-r from-indigo-50 to-white px-6 py-5 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
				<div class="flex items-center gap-3.5">
					<div class="w-11 h-11 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
					</div>
					<div>
						<h3 class="font-montserrat text-xl font-black text-neutral-900">{team.school}</h3>
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
									<button class="flex items-center gap-1 bg-indigo-100 border border-indigo-200 text-indigo-600 font-poppins text-[11px] font-bold px-2.5 py-1 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
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
{/if}

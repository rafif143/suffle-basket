<script>
	import { onMount } from 'svelte';
	import { registrationService } from '$lib/services';
	import { StatsCard, TeamDetailModal } from '$lib/components/features/ManagementPage';
	import { LoadingSkeleton } from '$lib/components/ui';

	let registrations = $state([]);
	let loading = $state(true);

	let searchQuery = $state('');
	let filterLevel = $state('All');
	let filterStatus = $state('All');
	let selectedTeam = $state(null);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			loading = true;
			const data = await registrationService.getAll();
			// Transform API data to match component format
			registrations = data.map(r => ({
				id: r.id,
				school: r.school_name,
				level: r.level,
				gender: r.gender,
				status: r.status,
				logo: r.logo_url,
				address: r.school_address,
				whatsapp: r.whatsapp,
				players: r.players,
				officials: r.officials,
				timestamp: r.created_at
			}));
		} catch (error) {
			console.error('Failed to load registrations:', error);
		} finally {
			loading = false;
		}
	}

	let currentPage = $state(1);
	const pageSize = 10;

	let filteredTeams = $derived(
		registrations.filter(t => {
			const matchSearch = t.school.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
			const matchLevel = filterLevel === 'All' || t.level === filterLevel;
			const matchStatus = filterStatus === 'All' || t.status === filterStatus;
			return matchSearch && matchLevel && matchStatus;
		})
	);

	// Reset ke page 1 kalau filter/search berubah
	$effect(() => {
		searchQuery; filterLevel; filterStatus;
		currentPage = 1;
	});

	let totalPages = $derived(Math.max(1, Math.ceil(filteredTeams.length / pageSize)));

	let paginatedTeams = $derived(
		filteredTeams.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	// Generate array nomor halaman dengan ellipsis
	let pageNumbers = $derived.by(() => {
		if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
		const pages = [];
		pages.push(1);
		if (currentPage > 3) pages.push('...');
		for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
			pages.push(i);
		}
		if (currentPage < totalPages - 2) pages.push('...');
		pages.push(totalPages);
		return pages;
	});

	let stats = $derived({
		total: registrations.length,
		pending: registrations.filter(r => r.status === 'Pending').length,
		verified: registrations.filter(r => r.status === 'Verified').length,
		rejected: registrations.filter(r => r.status === 'Rejected').length
	});

	async function updateStatus(id, newStatus) {
		try {
			await registrationService.updateStatus(id, newStatus);
			// Update local state
			registrations = registrations.map(r => r.id === id ? { ...r, status: newStatus } : r);
			if (selectedTeam && selectedTeam.id === id) {
				selectedTeam = { ...selectedTeam, status: newStatus };
			}
		} catch (error) {
			console.error('Failed to update status:', error);
			alert('Failed to update status. Please try again.');
		}
	}

	async function deleteTeam(id) {
		try {
			await registrationService.delete(id);
			// Remove from local state
			registrations = registrations.filter(r => r.id !== id);
			// Close modal
			selectedTeam = null;
			alert('✅ Registration deleted successfully!');
		} catch (error) {
			console.error('Failed to delete registration:', error);
			alert('❌ Failed to delete registration. Please try again.');
		}
	}

	function closeDetail() { 
		selectedTeam = null; 
	}
</script>

<svelte:head>
	<title>Management | Yadika Cup</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50 flex flex-col">
	<!-- Header -->
	<header class="bg-white/90 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
		<div class="px-8 py-5 flex items-center justify-between flex-wrap gap-4">
			<div>
				<h1 class="font-montserrat text-2xl font-extrabold text-neutral-900">Management Console</h1>
				<p class="text-xs text-neutral-400 mt-1">Review and verify team registrations</p>
			</div>
			<span class="bg-indigo-100 text-indigo-700 border border-indigo-200 font-poppins text-[11px] font-bold px-3 py-1.5 rounded-full">Admin Mode</span>
		</div>
	</header>

	<main class="flex-1 px-8 py-7">
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
			<StatsCard label="Total Teams" value={stats.total} total={stats.total} variant="default" />
			<StatsCard label="Pending" value={stats.pending} total={stats.total} variant="pending" />
			<StatsCard label="Verified" value={stats.verified} total={stats.total} variant="verified" />
			<StatsCard label="Rejected" value={stats.rejected} total={stats.total} variant="rejected" />
		</div>

		<!-- Filters -->
		<div class="flex gap-2.5 mb-4 flex-wrap">
			<div class="relative flex-1 min-w-[200px]">
				<svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
				<input type="text" bind:value={searchQuery} placeholder="Search school name or ID…" class="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
			</div>
			
			<div class="relative">
				<select bind:value={filterLevel} class="appearance-none pl-3.5 pr-10 py-2.5 bg-white border-2 border-neutral-200 rounded-xl font-poppins text-sm font-semibold text-neutral-700 outline-none cursor-pointer transition-all focus:border-indigo-500">
					<option value="All">All Levels</option>
					<option value="SMA">SMA</option>
					<option value="SMP">SMP</option>
				</select>
				<svg class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
			</div>
			
			<div class="relative">
				<select bind:value={filterStatus} class="appearance-none pl-3.5 pr-10 py-2.5 bg-white border-2 border-neutral-200 rounded-xl font-poppins text-sm font-semibold text-neutral-700 outline-none cursor-pointer transition-all focus:border-indigo-500">
					<option value="All">All Status</option>
					<option value="Pending">Pending</option>
					<option value="Verified">Verified</option>
					<option value="Rejected">Rejected</option>
				</select>
				<svg class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
			</div>
		</div>

		<!-- Table -->
		<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 overflow-hidden shadow-sm">
			{#if loading}
				<LoadingSkeleton type="table" count={5} />
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-linear-to-r from-indigo-50 to-white border-b border-neutral-200">
							<tr>
								<th class="px-4 py-3.5 text-left text-[10px] font-montserrat font-extrabold text-neutral-600 uppercase tracking-wide">Logo</th>
								<th class="px-4 py-3.5 text-left text-[10px] font-montserrat font-extrabold text-neutral-600 uppercase tracking-wide">Team ID</th>
								<th class="px-4 py-3.5 text-left text-[10px] font-montserrat font-extrabold text-neutral-600 uppercase tracking-wide">School</th>
								<th class="px-4 py-3.5 text-left text-[10px] font-montserrat font-extrabold text-neutral-600 uppercase tracking-wide">Category</th>
								<th class="px-4 py-3.5 text-center text-[10px] font-montserrat font-extrabold text-neutral-600 uppercase tracking-wide">Players</th>
								<th class="px-4 py-3.5 text-center text-[10px] font-montserrat font-extrabold text-neutral-600 uppercase tracking-wide">Status</th>
								<th class="px-4 py-3.5 text-right text-[10px] font-montserrat font-extrabold text-neutral-600 uppercase tracking-wide">Action</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-neutral-100">
							{#each paginatedTeams as team}
								<tr class="hover:bg-neutral-50/50 transition-colors">
									<td class="px-4 py-4">
										{#if team.logo}
											<div class="w-10 h-10 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden">
												<img src={team.logo} alt="{team.school} logo" class="w-full h-full object-contain" />
											</div>
										{:else}
											<div class="w-10 h-10 rounded-lg border border-neutral-200 bg-neutral-100 flex items-center justify-center">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
											</div>
										{/if}
									</td>
									<td class="px-4 py-4">
										<span class="block font-montserrat text-sm font-extrabold text-indigo-600">{team.id}</span>
										<span class="block text-[11px] text-neutral-400 mt-0.5">{team.timestamp}</span>
									</td>
									<td class="px-4 py-4">
										<span class="block font-poppins text-sm font-bold text-neutral-900">{team.school}</span>
										<span class="block text-[11px] text-neutral-500 mt-0.5">+62 {team.whatsapp}</span>
									</td>
									<td class="px-4 py-4">
										<div class="flex gap-1.5">
											<span class="text-[11px] font-poppins font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">{team.level}</span>
											<span class="text-[11px] font-poppins font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">{team.gender}</span>
										</div>
									</td>
									<td class="px-4 py-4 text-center">
										<span class="inline-flex items-center justify-center w-7 h-7 bg-neutral-100 rounded-lg font-montserrat text-sm font-extrabold text-neutral-700">{team.players.length}</span>
									</td>
									<td class="px-4 py-4 text-center">
										{#if team.status === 'Pending'}
											<span class="inline-flex bg-amber-100 text-amber-700 border border-amber-200 text-[11px] px-3 py-1 rounded-full font-poppins font-bold">Pending</span>
										{:else if team.status === 'Verified'}
											<span class="inline-flex bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] px-3 py-1 rounded-full font-poppins font-bold">Verified</span>
										{:else}
											<span class="inline-flex bg-rose-100 text-rose-700 border border-rose-200 text-[11px] px-3 py-1 rounded-full font-poppins font-bold">Rejected</span>
										{/if}
									</td>
									<td class="px-4 py-4 text-right">
										<div class="flex items-center justify-end gap-2">
											<button 
												onclick={() => selectedTeam = team} 
												class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-poppins font-semibold text-xs rounded-lg transition-colors"
											>
												View
											</button>
											<button 
												onclick={async () => {
													if (confirm(`Delete ${team.school}? This cannot be undone.`)) {
														await deleteTeam(team.id);
													}
												}}
												class="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition-colors"
												title="Delete registration"
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
											</button>
										</div>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="6" class="px-4 py-16 text-center">
										<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-neutral-300"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
										<p class="font-montserrat text-base font-bold text-neutral-400">No registrations found</p>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				{#if totalPages > 1 || filteredTeams.length > 0}
					<div class="flex items-center justify-between px-5 py-3.5 border-t border-neutral-100">
						<!-- Info -->
						<p class="text-xs font-poppins text-neutral-400">
							Showing <span class="font-semibold text-neutral-600">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredTeams.length)}</span> of <span class="font-semibold text-neutral-600">{filteredTeams.length}</span> teams
						</p>

						<!-- Controls -->
						<div class="flex items-center gap-1">
							<!-- Prev -->
							<button
								onclick={() => currentPage = Math.max(1, currentPage - 1)}
								disabled={currentPage === 1}
								class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-poppins text-xs font-semibold transition-all border
									{currentPage === 1
										? 'border-neutral-100 text-neutral-300 cursor-not-allowed'
										: 'border-neutral-200 text-neutral-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'}"
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
									<path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/>
								</svg>
								Prev
							</button>

							<!-- Page Numbers -->
							{#each pageNumbers as page}
								{#if page === '...'}
									<span class="px-2 py-1.5 text-xs text-neutral-400 font-poppins">…</span>
								{:else}
									<button
										onclick={() => currentPage = page}
										class="min-w-[32px] h-8 px-2 rounded-lg font-poppins text-xs font-semibold transition-all border
											{currentPage === page
												? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200'
												: 'border-neutral-200 text-neutral-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'}"
									>
										{page}
									</button>
								{/if}
							{/each}

							<!-- Next -->
							<button
								onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
								disabled={currentPage === totalPages}
								class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-poppins text-xs font-semibold transition-all border
									{currentPage === totalPages
										? 'border-neutral-100 text-neutral-300 cursor-not-allowed'
										: 'border-neutral-200 text-neutral-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'}"
							>
								Next
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
									<path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>
								</svg>
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</main>
</div>

<!-- Team Detail Modal -->
<TeamDetailModal 
	team={selectedTeam}
	onClose={closeDetail}
	onUpdateStatus={updateStatus}
	onDelete={deleteTeam}
/>

<script>
	// Dummy Data for Preview
	let registrations = $state([
		{
			id: 'REG-001',
			school: 'SMAN 70 JAKARTA',
			level: 'SMA',
			gender: 'Putra',
			whatsapp: '81234567890',
			address: 'Jl. Bulungan No.1, RT.11/RW.7, Kramat Pela, Kec. Kby. Baru, Kota Jakarta Selatan',
			players: [
				{ name: 'Budi Santoso', card: 'id_card_01.jpg' },
				{ name: 'Agus Setiawan', card: 'id_card_02.jpg' },
				{ name: 'Dedi Kurniawan', card: 'id_card_03.jpg' },
				{ name: 'Eko Prasetyo', card: 'id_card_04.jpg' },
				{ name: 'Fajar Ramadhan', card: 'id_card_05.jpg' }
			],
			officials: ['Coach Wijaya', 'Manager Rina'],
			status: 'Verified',
			timestamp: '2024-03-07 14:20'
		},
		{
			id: 'REG-002',
			school: 'SMPN 115 JAKARTA',
			level: 'SMP',
			gender: 'Putri',
			whatsapp: '8987654321',
			address: 'Jl. Tebet Utara III No.1, RT.4/RW.2, Tebet Tim., Kec. Tebet, Kota Jakarta Selatan',
			players: [
				{ name: 'Siti Aminah', card: 'id_card_06.jpg' },
				{ name: 'Ani Wijaya', card: 'id_card_07.jpg' },
				{ name: 'Lia Lestari', card: 'id_card_08.jpg' },
				{ name: 'Maya Sari', card: 'id_card_09.jpg' },
				{ name: 'Indah Permata', card: 'id_card_10.jpg' }
			],
			officials: ['Coach Bambang', 'Manager Sari'],
			status: 'Pending',
			timestamp: '2024-03-08 09:15'
		},
		{
			id: 'REG-003',
			school: 'SMA LABSCHOOL',
			level: 'SMA',
			gender: 'Putra',
			whatsapp: '81122334455',
			address: 'Jl. Pemuda No.7, RT.7/RW.14, Rawamangun, Kec. Pulo Gadung, Kota Jakarta Timur',
			players: [
				{ name: 'Kevin Ardiansyah', card: 'id_card_11.jpg' },
				{ name: 'Rayan Putra', card: 'id_card_12.jpg' },
				{ name: 'Dimas Aditya', card: 'id_card_13.jpg' },
				{ name: 'Arif Rahman', card: 'id_card_14.jpg' },
				{ name: 'Rizky Pratama', card: 'id_card_15.jpg' }
			],
			officials: ['Coach Hendra', 'Manager Taufik'],
			status: 'Rejected',
			timestamp: '2024-03-06 16:45'
		}
	]);

	let searchQuery = $state('');
	let filterLevel = $state('All');
	let filterStatus = $state('All');
	let selectedTeam = $state(null);

	// Derived logic for table filtering
	let filteredTeams = $derived(
		registrations.filter(t => {
			const matchSearch = t.school.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
			const matchLevel = filterLevel === 'All' || t.level === filterLevel;
			const matchStatus = filterStatus === 'All' || t.status === filterStatus;
			return matchSearch && matchLevel && matchStatus;
		})
	);

	// Stats logic
	let stats = $derived({
		total: registrations.length,
		pending: registrations.filter(r => r.status === 'Pending').length,
		verified: registrations.filter(r => r.status === 'Verified').length,
		rejected: registrations.filter(r => r.status === 'Rejected').length
	});

	function updateStatus(id, newStatus) {
		registrations = registrations.map(r => r.id === id ? { ...r, status: newStatus } : r);
		if (selectedTeam && selectedTeam.id === id) {
			selectedTeam = { ...selectedTeam, status: newStatus };
		}
	}

	function closeDetail() {
		selectedTeam = null;
	}
</script>

<svelte:head>
	<title>Management Dashboard | Championship Draw</title>
</svelte:head>

<div class="min-h-screen bg-neutral-50 text-neutral-900 font-poppins selection:bg-indigo-500 selection:text-white">
	<!-- Top Navbar -->
	<header class="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md px-6 py-4">
		<div class="max-w-7xl mx-auto flex items-center justify-between">
			<div class="flex items-center gap-4">
				<a href="/" class="p-2 hover:bg-neutral-100 rounded-xl transition-colors" aria-label="Back to Draw Page">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
				</a>
				<h1 class="font-bebas text-3xl tracking-widest text-neutral-900 uppercase mt-1">
					Management <span class="text-indigo-600">Console</span>
				</h1>
			</div>
			<div class="flex items-center gap-3">
				<div class="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
					<span class="text-xs font-bold text-indigo-600 uppercase tracking-widest">Admin Mode</span>
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto p-6 md:p-8">
		<!-- Stats Grid -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
			<div class="bg-white border-2 border-indigo-600 p-6 rounded-3xl shadow-sm">
				<p class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Teams</p>
				<h3 class="text-4xl font-bebas text-neutral-900">{stats.total}</h3>
			</div>
			<div class="bg-white border-2 border-indigo-600 p-6 rounded-3xl shadow-sm">
				<p class="text-xs font-bold text-yellow-600/60 uppercase tracking-widest mb-1">Pending</p>
				<h3 class="text-4xl font-bebas text-yellow-600">{stats.pending}</h3>
			</div>
			<div class="bg-white border-2 border-indigo-600 p-6 rounded-3xl shadow-sm">
				<p class="text-xs font-bold text-indigo-600/60 uppercase tracking-widest mb-1">Verified</p>
				<h3 class="text-4xl font-bebas text-indigo-600">{stats.verified}</h3>
			</div>
			<div class="bg-white border-2 border-indigo-600 p-6 rounded-3xl shadow-sm">
				<p class="text-xs font-bold text-red-600/60 uppercase tracking-widest mb-1">Rejected</p>
				<h3 class="text-4xl font-bebas text-red-600">{stats.rejected}</h3>
			</div>
		</div>

		<!-- Filter Bar -->
		<div class="flex flex-col lg:flex-row gap-4 mb-6">
			<div class="relative flex-1">
				<svg class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
				<input type="text" bind:value={searchQuery} placeholder="Search by School Name or ID..." 
					class="w-full bg-white border border-neutral-200 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-indigo-500 text-neutral-900 placeholder:text-neutral-300 font-bold transition-all shadow-sm" />
			</div>
			<div class="flex gap-3">
				<select bind:value={filterLevel} class="bg-white border border-neutral-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 text-neutral-900 font-bold appearance-none cursor-pointer min-w-[120px] shadow-sm">
					<option value="All">All Levels</option>
					<option value="SMA">SMA</option>
					<option value="SMP">SMP</option>
				</select>
				<select bind:value={filterStatus} class="bg-white border border-neutral-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 text-neutral-900 font-bold appearance-none cursor-pointer min-w-[140px] shadow-sm">
					<option value="All">All Status</option>
					<option value="Pending">Pending</option>
					<option value="Verified">Verified</option>
					<option value="Rejected">Rejected</option>
				</select>
			</div>
		</div>

		<!-- Main Table -->
		<div class="bg-white border-2 border-indigo-600 rounded-3xl overflow-hidden shadow-sm">
			<div class="overflow-x-auto scrollbar-thin">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="border-b border-neutral-100 bg-neutral-50/50 font-bebas tracking-widest text-neutral-400">
							<th class="px-6 py-5 uppercase font-bold text-sm">Team ID</th>
							<th class="px-6 py-5 uppercase font-bold text-sm">School Name</th>
							<th class="px-6 py-5 uppercase font-bold text-sm">Category</th>
							<th class="px-6 py-5 uppercase font-bold text-sm text-center">Status</th>
							<th class="px-6 py-5 uppercase font-bold text-sm text-right">Action</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-neutral-100">
						{#each filteredTeams as team (team.id)}
							<tr class="group hover:bg-neutral-50 transition-all">
								<td class="px-6 py-5">
									<span class="font-bebas font-bold text-neutral-400 text-base tracking-widest">{team.id}</span>
									<p class="text-xs text-neutral-400 font-bold uppercase mt-1">{team.timestamp}</p>
								</td>
								<td class="px-6 py-5">
									<h4 class="font-bold text-neutral-900 text-base leading-tight uppercase tracking-wide">{team.school}</h4>
									<div class="flex items-center gap-1.5 mt-1">
										<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
										<span class="text-[11px] text-neutral-400 font-bold tracking-widest">+62 {team.whatsapp}</span>
									</div>
								</td>
								<td class="px-6 py-5">
									<div class="flex gap-2">
										<span class="px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-500">{team.level}</span>
										<span class="px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-500">{team.gender}</span>
									</div>
								</td>
								<td class="px-6 py-5">
									<div class="flex justify-center">
										{#if team.status === 'Pending'}
											<span class="px-3 py-1 bg-yellow-50 border border-yellow-100 text-yellow-600 text-xs font-black uppercase tracking-widest rounded-full">Pending</span>
										{:else if team.status === 'Verified'}
											<span class="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-full shadow-sm">Verified</span>
										{:else}
											<span class="px-3 py-1 bg-red-50 border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest rounded-full">Rejected</span>
										{/if}
									</div>
								</td>
								<td class="px-6 py-5">
									<div class="flex justify-end">
										<button onclick={() => selectedTeam = team} class="bg-indigo-600 hover:bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm">
											View Details
										</button>
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="5" class="px-6 py-20 text-center text-neutral-600">
									<div class="flex flex-col items-center gap-4">
										<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-30"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
										<p class="font-bebas text-2xl tracking-widest">No registrations found</p>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</main>

	<!-- Detail / Verification Modal -->
	{#if selectedTeam}
		<div class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-300">
			<div class="bg-white border border-neutral-200 rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
				<!-- Modal Header -->
				<div class="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
					<div class="flex items-center gap-4">
						<div class="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 text-indigo-600">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
						</div>
						<div>
							<h3 class="font-bebas text-3xl text-neutral-900 tracking-widest uppercase leading-none">{selectedTeam.school}</h3>
							<p class="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mt-1">{selectedTeam.id} • {selectedTeam.level} {selectedTeam.gender}</p>
						</div>
					</div>
					<button onclick={closeDetail} class="p-3 bg-white border border-neutral-100 hover:bg-neutral-50 text-neutral-400 rounded-full transition-colors shadow-sm" aria-label="Close detail">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
					</button>
				</div>

				<div class="flex-1 overflow-auto p-8 font-poppins">
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
						<!-- Left Side: Basic Info -->
						<div class="space-y-8">
							<section>
								<h5 class="text-[9px] font-black uppercase text-neutral-400 tracking-[0.3em] mb-4 pl-1">Contact & Location</h5>
								<div class="space-y-4">
									<div class="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
										<p class="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">WhatsApp</p>
										<p class="font-bold text-neutral-900 text-xl">+62 {selectedTeam.whatsapp}</p>
									</div>
									<div class="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
										<p class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Full Address</p>
										<p class="text-base font-bold text-neutral-900 leading-relaxed uppercase">{selectedTeam.address}</p>
									</div>
								</div>
							</section>

							<section>
								<h5 class="text-[9px] font-black uppercase text-neutral-400 tracking-[0.3em] mb-4 pl-1">Team Officials</h5>
								<div class="grid grid-cols-2 gap-3">
									{#each selectedTeam.officials as off}
										<div class="bg-white p-3 rounded-xl border border-neutral-100 text-xs font-bold text-neutral-900 uppercase tracking-wide">{off}</div>
									{/each}
								</div>
							</section>
						</div>

						<!-- Right Side: Players & IDs -->
						<div>
							<h5 class="text-[9px] font-black uppercase text-neutral-400 tracking-[0.3em] mb-4 pl-1">Players List & Documents</h5>
							<div class="bg-white rounded-3xl border border-neutral-100 overflow-hidden divide-y divide-neutral-100 shadow-sm">
								{#each selectedTeam.players as player (player.name)}
									<div class="flex items-center justify-between p-4 px-6 hover:bg-neutral-50 transition-colors group">
										<span class="font-bold text-neutral-900 uppercase text-base tracking-wide">{player.name}</span>
										<button class="flex items-center gap-2 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
											View ID
										</button>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Modal Footer: Actions -->
				<div class="p-8 border-t border-neutral-100 bg-neutral-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
					<div class="flex items-center gap-3">
						<p class="text-xs font-black text-neutral-400 uppercase tracking-widest">Status:</p>
						{#if selectedTeam.status === 'Pending'}
							<span class="px-4 py-1.5 bg-yellow-50 border border-yellow-100 text-yellow-600 text-xs font-black uppercase tracking-widest rounded-full">Pending Verification</span>
						{:else if selectedTeam.status === 'Verified'}
							<span class="px-4 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-full shadow-sm">Verified</span>
						{:else}
							<span class="px-4 py-1.5 bg-red-50 border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest rounded-full">Rejected</span>
						{/if}
					</div>

					<div class="flex items-center gap-4 w-full md:w-auto">
						<button onclick={() => updateStatus(selectedTeam.id, 'Rejected')} 
							class="flex-1 md:flex-none px-8 py-4 bg-white hover:bg-red-600 hover:text-white border border-neutral-200 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm">
							Reject
						</button>
						<button onclick={() => updateStatus(selectedTeam.id, 'Verified')} 
							class="flex-1 md:flex-none px-12 py-4 bg-indigo-600 text-white border border-transparent hover:bg-neutral-900 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100">
							Verify & Approve
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		background-color: #f8fafc;
	}

	/* Custom Scrollbar for the table and list */
	.scrollbar-thin::-webkit-scrollbar {
		width: 6px;
		height: 6px;
	}
	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: #e5e5e5;
		border-radius: 10px;
	}
	.scrollbar-thin::-webkit-scrollbar-thumb:hover {
		background: #d4d4d4;
	}
	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}
</style>

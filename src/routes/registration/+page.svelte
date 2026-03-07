<script>
	import NotificationModal from "$lib/NotificationModal.svelte";

	let schoolName = $state('');
	let schoolAddress = $state('');
	let whatsapp = $state('');
	let level = $state('SMA');
	let gender = $state('Putra');

	let players = $state([
		{ name: '', card: null },
		{ name: '', card: null },
		{ name: '', card: null },
		{ name: '', card: null },
		{ name: '', card: null }
	]); // Start with min 5
	let officials = $state(['', '']);

	let submissionStatus = $state(null); // 'submitting', 'success', 'error'
	
	// Error Modal State
	let errorModal = $state({
		isOpen: false,
		title: 'File Too Large',
		message: ''
	});

	function addPlayer() {
		if (players.length < 10) {
			players = [...players, { name: '', card: null }];
		}
	}

	function removePlayer(index) {
		if (players.length > 5) {
			players = players.filter((_, i) => i !== index);
		}
	}

	function handlePlayerCardChange(index, e) {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 2 * 1024 * 1024) {
				errorModal.message = `File ${file.name} exceeds 2MB limit. Please upload a smaller file.`;
				errorModal.isOpen = true;
				return;
			}
			players[index].card = file;
		}
	}

	function removePlayerCard(index) {
		players[index].card = null;
	}

	function handleSubmit(e) {
		e.preventDefault();
		submissionStatus = 'submitting';
		
		// Simulate API call
		setTimeout(() => {
			submissionStatus = 'success';
			// In real app, you'd send FormData here
		}, 2000);
	}
</script>

<svelte:head>
	<title>Registration | Championship Draw</title>
</svelte:head>

<div class="min-h-screen bg-neutral-50 text-neutral-900 font-poppins selection:bg-indigo-500 selection:text-white pb-20">
	<!-- Decorative BG -->
	<div class="fixed inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
		<div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
	</div>

	<div class="container mx-auto px-4 pt-12 relative z-10">
		<div class="max-w-4xl mx-auto">
			<!-- Header -->
			<div class="text-center mb-12">
				<h1 class="font-bebas text-5xl md:text-7xl tracking-tighter mb-4 text-neutral-900 uppercase">
					Team <span class="text-indigo-600">Registration</span>
				</h1>
				<p class="text-neutral-500 text-lg md:text-xl font-medium tracking-wide">
					Fill in the details to register your school team for the championship.
				</p>
			</div>

			<form onsubmit={handleSubmit} class="space-y-8">
				<!-- School Info Section -->
				<div class="bg-white border-2 border-indigo-600 rounded-3xl p-6 md:p-10 shadow-xl">
					<h2 class="text-xl font-bold text-indigo-600 mb-8 tracking-widest uppercase flex items-center gap-3">
						<span class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bebas text-lg">01</span>
						School Information
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="space-y-2">
							<label for="school-name" class="text-sm font-bold text-neutral-500 uppercase tracking-widest pl-1">School Name</label>
							<input id="school-name" type="text" bind:value={schoolName} required placeholder="e.g. SMAN 70 JAKARTA" 
								class="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-neutral-900 placeholder:text-neutral-300 font-bold" />
						</div>
						<div class="space-y-2 text-center md:text-left">
							<span class="text-sm font-bold text-neutral-500 uppercase tracking-widest pl-1">Category</span>
							<div class="flex gap-2 p-1 bg-neutral-50 border border-neutral-100 rounded-2xl">
								{#each ['SMA', 'SMP'] as l}
									<button type="button" onclick={() => level = l} class="flex-1 py-3 rounded-xl font-bold transition-all text-lg {level === l ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'}">{l}</button>
								{/each}
								<div class="w-px bg-neutral-200 my-2 mx-1"></div>
								{#each ['Putra', 'Putri'] as g}
									<button type="button" onclick={() => gender = g} class="flex-1 py-3 rounded-xl font-bold transition-all text-lg {gender === g ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'}">{g}</button>
								{/each}
							</div>
						</div>
						<div class="col-span-1 md:col-span-2 space-y-2">
							<label for="address" class="text-sm font-bold text-neutral-500 uppercase tracking-widest pl-1">School Address</label>
							<textarea id="address" bind:value={schoolAddress} required rows="3" placeholder="Enter complete address..." 
								class="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-neutral-900 placeholder:text-neutral-300 font-bold text-lg"></textarea>
						</div>
						<div class="space-y-2">
							<label for="whatsapp" class="text-base font-bold text-neutral-500 uppercase tracking-widest pl-1">Contact (WhatsApp)</label>
							<div class="relative">
								<span class="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-lg">+62</span>
								<input id="whatsapp" type="tel" bind:value={whatsapp} required placeholder="81234567890" 
									class="w-full bg-neutral-50 border border-neutral-100 rounded-2xl pl-16 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-neutral-900 placeholder:text-neutral-300 font-bold text-lg" />
							</div>
						</div>
					</div>
				</div>

				<!-- Team Section -->
				<div class="bg-white border-2 border-indigo-600 rounded-3xl p-6 md:p-10 shadow-xl">
					<h2 class="text-xl font-bold text-indigo-600 mb-8 tracking-widest uppercase flex items-center justify-between">
						<div class="flex items-center gap-3">
							<span class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bebas text-lg">02</span>
							Players List
						</div>
						<span class="text-sm text-neutral-400 underline decoration-indigo-200 font-bold">Min 5 - Max 10 players</span>
					</h2>
					
					<div class="space-y-4 mb-8">
						{#each players as player, i}
							<div class="flex flex-col md:flex-row gap-3 p-4 bg-neutral-50 border-2 border-indigo-600 rounded-2xl animate-in fade-in slide-in-from-left-4 duration-300">
								<div class="flex gap-3 flex-1">
									<div class="bg-white border border-neutral-200 rounded-xl px-4 flex items-center justify-center font-bebas text-xl text-neutral-400 w-12 shrink-0">{i + 1}</div>
									<input type="text" bind:value={players[i].name} required placeholder="Player Full Name" 
										class="flex-1 bg-transparent border-none px-2 py-3 text-neutral-900 placeholder:text-neutral-300 font-bold focus:outline-none" />
								</div>
								
								<div class="flex items-center gap-3">
									{#if player.card}
										<div class="flex items-center gap-2 bg-green-50 border border-green-100 px-3 py-2 rounded-xl text-green-600">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
											<span class="text-xs font-black truncate max-w-[100px] uppercase">ID UPLOADED</span>
											<button type="button" onclick={() => removePlayerCard(i)} class="text-neutral-400 hover:text-red-500 transition-colors" aria-label="Remove ID card">
												<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
											</button>
										</div>
									{:else}
										<label class="flex items-center gap-2 bg-white border border-neutral-200 hover:border-indigo-500/50 px-4 py-2 rounded-xl cursor-pointer transition-all">
											<input type="file" accept="image/*" required onchange={(e) => handlePlayerCardChange(i, e)} class="hidden" />
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
											<span class="text-xs font-black text-neutral-400 uppercase tracking-widest">UPLOAD ID</span>
										</label>
									{/if}

									{#if players.length > 5}
										<button type="button" onclick={() => removePlayer(i)} class="p-2 text-neutral-300 hover:text-red-500 transition-all" aria-label="Remove player">
											<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
										</button>
									{/if}
								</div>
							</div>
						{/each}
						
						{#if players.length < 10}
							<button type="button" onclick={addPlayer} class="w-full py-4 border-2 border-dashed border-neutral-100 rounded-2xl text-neutral-400 hover:border-indigo-500/50 hover:text-indigo-600 transition-all font-bold flex items-center justify-center gap-2 text-sm">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
								ADD PLAYER
							</button>
						{/if}
					</div>

					<h2 class="font-bold text-indigo-600 mb-6 tracking-widest uppercase flex items-center gap-3">
						Team Officials
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each officials as official, i}
							<div class="space-y-2">
								<label for="official-{i}" class="text-sm font-bold text-neutral-400 uppercase tracking-widest pl-1">Official {i + 1}</label>
								<input id="official-{i}" type="text" bind:value={officials[i]} required placeholder="Official Name" 
									class="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-neutral-900 placeholder:text-neutral-300 font-bold text-lg" />
							</div>
						{/each}
					</div>
				</div>

				<!-- Upload Section -->
				<div class="bg-white border-2 border-indigo-600 rounded-3xl p-6 md:p-10 shadow-xl">
					<h2 class="text-xl font-bold text-indigo-600 mb-8 tracking-widest uppercase flex items-center gap-3">
						<span class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bebas text-lg">03</span>
						Documents & Payment
					</h2>
					
					<div class="space-y-6">
						<p class="text-sm font-medium text-neutral-500 italic">
							* Please ensure all player ID cards are uploaded in the player list section above. Max 2MB per file.
						</p>

						<div class="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl group transition-all">
							<div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
								<div>
									<h4 class="font-bebas text-2xl text-indigo-600 tracking-wide mb-1">Registration Fee</h4>
									<p class="text-neutral-500 text-sm font-medium">Rp. 350.000 / Team</p>
								</div>
								<div class="h-px md:h-12 w-full md:w-px bg-indigo-200"></div>
								<div class="text-right">
									<h4 class="font-bebas text-2xl text-neutral-900 tracking-widest mb-1 uppercase">Transfer BCA</h4>
									<p class="text-2xl font-bold text-neutral-900 tracking-tighter">123 456 7890</p>
									<p class="text-neutral-400 text-sm font-bold tracking-widest uppercase">A/N PANITIA CHAMPIONSHIP</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Submit Button -->
				<button type="submit" disabled={submissionStatus === 'submitting'} 
					class="w-full p-6 bg-indigo-600 text-white font-bold text-xl tracking-widest uppercase rounded-3xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:bg-neutral-900 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-4">
					{#if submissionStatus === 'submitting'}
						<svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
						REGISTERING...
					{:else}
						SUBMIT REGISTRATION
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
					{/if}
				</button>
			</form>
		</div>
	</div>

	{#if submissionStatus === 'success'}
		<div class="fixed inset-0 z-200 flex items-center justify-center bg-white/90 backdrop-blur-md animate-in fade-in duration-500 p-4">
			<div class="bg-white border border-neutral-200 rounded-[40px] p-8 md:p-12 max-w-lg w-full text-center shadow-2xl">
				<div class="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100">
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
				</div>
				<h3 class="font-bebas text-4xl text-neutral-900 tracking-widest mb-4 uppercase">Registration Sent!</h3>
				<p class="text-neutral-500 mb-10 font-medium leading-relaxed uppercase text-sm tracking-wide">
					Thank you for registering. Our committee will verify your documents within 24 hours. Please keep your WhatsApp active.
				</p>
				<a href="/" class="block w-full py-5 bg-indigo-600 hover:bg-neutral-900 text-white font-bold tracking-[0.2em] rounded-2xl transition-all uppercase text-sm">Back to Home</a>
			</div>
		</div>
	{/if}

	<NotificationModal 
		isOpen={errorModal.isOpen}
		title={errorModal.title}
		message={errorModal.message}
		type="alert"
		onConfirm={() => errorModal.isOpen = false}
		onClose={() => errorModal.isOpen = false}
	/>
</div>

<style>
	:global(body) {
		background-color: #f8fafc;
	}
	
	input[type="tel"]::placeholder {
		font-weight: normal;
	}
</style>

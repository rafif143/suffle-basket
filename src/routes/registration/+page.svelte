<script>
	import { onMount } from 'svelte';
	import { settingsService, registrationService } from '$lib/services';
	import { NotificationModal } from '$lib/components/ui';
	import { PlayerRow } from '$lib/components/features/RegistrationPage';

	let schoolName = $state('');
	let schoolAddress = $state('');
	let whatsapp = $state('');
	let level = $state('SMA');
	let gender = $state('Putra');
	let schoolLogo = $state(null);

	let players = $state([
		{ name: '', card: null },
		{ name: '', card: null },
		{ name: '', card: null },
		{ name: '', card: null },
		{ name: '', card: null }
	]);
	let officials = $state(['', '']);
	let submissionStatus = $state(null);

	// Settings from API
	let settings = $state({
		bankName: 'Bank BCA',
		accountNumber: '123 456 7890',
		accountName: 'Panitia Championship',
		registrationFee: '350000',
		whatsappContact: ''
	});

	let errorModal = $state({
		isOpen: false,
		title: 'File Too Large',
		message: ''
	});

	onMount(async () => {
		try {
			const data = await settingsService.getSettings();
			if (data) {
				settings = {
					bankName: data.bank_name,
					accountNumber: data.account_number,
					accountName: data.account_name,
					registrationFee: data.registration_fee,
					whatsappContact: data.whatsapp_contact || ''
				};
			}
		} catch (error) {
			console.error('Failed to load settings:', error);
		}
	});

	function addPlayer() {
		if (players.length < 10) players = [...players, { name: '', card: null }];
	}

	function removePlayer(index) {
		if (players.length > 5) players = players.filter((_, i) => i !== index);
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

	function handleLogoChange(e) {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 2 * 1024 * 1024) {
				errorModal.message = `Logo file ${file.name} exceeds 2MB limit. Please upload a smaller file.`;
				errorModal.isOpen = true;
				return;
			}
			schoolLogo = file;
		}
	}

	function removeSchoolLogo() {
		schoolLogo = null;
	}

	async function handleSubmit(e) {
		e.preventDefault();
		submissionStatus = 'submitting';
		
		try {
			const registrationData = {
				schoolName,
				schoolAddress,
				whatsapp,
				level,
				gender,
				players: players.map(p => ({ name: p.name, card: p.card })),
				officials,
				logoFile: schoolLogo
			};

			await registrationService.save(registrationData);
			submissionStatus = 'success';
			
			// Reset form after 2 seconds
			setTimeout(() => {
				schoolName = '';
				schoolAddress = '';
				whatsapp = '';
				level = 'SMA';
				gender = 'Putra';
				schoolLogo = null;
				players = [
					{ name: '', card: null },
					{ name: '', card: null },
					{ name: '', card: null },
					{ name: '', card: null },
					{ name: '', card: null }
				];
				officials = ['', ''];
				submissionStatus = null;
			}, 2000);
		} catch (error) {
			console.error('Registration failed:', error);
			submissionStatus = 'error';
			errorModal.title = 'Registration Failed';
			errorModal.message = error.message || 'Failed to submit registration. Please try again.';
			errorModal.isOpen = true;
		}
	}

	let filledPlayers = $derived(players.filter(p => p.name.trim()).length);
	let cardsUploaded = $derived(players.filter(p => p.card).length);
</script>

<svelte:head>
	<title>Registration | Yadika Cup</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50 flex flex-col">
	<!-- Header -->
	<header class="bg-white/90 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
		<div class="px-8 py-5 flex items-center justify-between flex-wrap gap-4">
			<div>
				<h1 class="font-montserrat text-2xl font-extrabold text-neutral-900">Team Registration</h1>
				<p class="text-xs text-neutral-400 mt-1">Register your school team for Yadika Cup Championship</p>
			</div>
			<div class="flex gap-2.5">
				<div class="flex bg-neutral-100 rounded-xl p-0.5 gap-0.5">
					{#each ['SMA', 'SMP'] as l}
						<button type="button" class="px-4 py-1.5 rounded-lg font-poppins text-sm font-semibold transition-all {level === l ? 'bg-white text-indigo-600 shadow-sm' : 'text-neutral-500'}" onclick={() => level = l}>{l}</button>
					{/each}
				</div>
				<div class="flex bg-neutral-100 rounded-xl p-0.5 gap-0.5">
					{#each ['Putra', 'Putri'] as g}
						<button type="button" class="px-4 py-1.5 rounded-lg font-poppins text-sm font-semibold transition-all {gender === g ? 'bg-white text-indigo-600 shadow-sm' : 'text-neutral-500'}" onclick={() => gender = g}>{g}</button>
					{/each}
				</div>
			</div>
		</div>
	</header>

	<!-- Form -->
	<main class="flex-1 px-8 py-7">
		<form onsubmit={handleSubmit} class="max-w-3xl mx-auto space-y-5">

			<!-- Section 1: School Info -->
			<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-6">
				<div class="flex items-start gap-3.5 mb-5">
					<div class="w-9 h-9 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-lg shadow-indigo-200 flex-shrink-0">01</div>
					<div>
						<h2 class="font-montserrat text-base font-extrabold text-neutral-900">School Information</h2>
						<p class="text-xs text-neutral-400 mt-0.5">Basic details about your school and team</p>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="school-name" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">School Name</label>
						<input id="school-name" type="text" bind:value={schoolName} required placeholder="e.g. SMAN 70 Jakarta" class="w-full px-3.5 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white" />
					</div>

					<div class="space-y-1.5">
						<label for="whatsapp" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">WhatsApp Contact</label>
						<div class="relative">
							<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-600 pointer-events-none">+62</span>
							<input id="whatsapp" type="tel" bind:value={whatsapp} required placeholder="81234567890" class="w-full pl-12 pr-3.5 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white" />
						</div>
					</div>

					<div class="md:col-span-2 space-y-1.5">
						<label for="address" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">School Address</label>
						<textarea id="address" bind:value={schoolAddress} required rows="3" placeholder="Complete school address..." class="w-full px-3.5 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none resize-vertical min-h-[80px] transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white"></textarea>
					</div>

					<div class="md:col-span-2 space-y-1.5">
						<label for="school-logo" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">School Logo</label>
						<div class="flex items-start gap-3">
							{#if schoolLogo}
								<div class="relative group">
									<div class="w-20 h-20 rounded-xl border-2 border-indigo-200 bg-indigo-50 flex items-center justify-center overflow-hidden">
										<img src={URL.createObjectURL(schoolLogo)} alt="School logo preview" class="w-full h-full object-contain" />
									</div>
									<button
										type="button"
										onclick={removeSchoolLogo}
										class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
										aria-label="Remove logo"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
									</button>
								</div>
								<div class="flex-1">
									<p class="text-xs font-poppins font-semibold text-neutral-700 mb-1">{schoolLogo.name}</p>
									<p class="text-xs text-neutral-400">{(schoolLogo.size / 1024).toFixed(1)} KB</p>
								</div>
							{:else}
								<label for="school-logo" class="flex-1 cursor-pointer">
									<div class="border-2 border-dashed border-neutral-300 rounded-xl p-4 hover:border-indigo-400 hover:bg-indigo-50 transition-all">
										<div class="flex items-center gap-3">
											<div class="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
												<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
											</div>
											<div>
												<p class="text-sm font-poppins font-semibold text-neutral-700">Upload School Logo</p>
												<p class="text-xs text-neutral-400 mt-0.5">PNG, JPG up to 2MB</p>
											</div>
										</div>
									</div>
									<input
										id="school-logo"
										type="file"
										accept="image/png,image/jpeg,image/jpg"
										onchange={handleLogoChange}
										class="hidden"
									/>
								</label>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Section 2: Players -->
			<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-6">
				<div class="flex items-start gap-3.5 mb-5">
					<div class="w-9 h-9 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-lg shadow-indigo-200 flex-shrink-0">02</div>
					<div class="flex-1">
						<h2 class="font-montserrat text-base font-extrabold text-neutral-900">Players & Officials</h2>
						<p class="text-xs text-neutral-400 mt-0.5">Min 5 · Max 10 players. Upload each player's student ID card (max 2MB).</p>
					</div>
					<div class="flex items-baseline gap-0.5">
						<span class="font-montserrat text-2xl font-black text-indigo-600">{players.length}</span>
						<span class="text-sm font-semibold text-neutral-400">/10</span>
					</div>
				</div>

				<!-- Progress Bar -->
				<div class="h-1 bg-neutral-100 rounded-full overflow-hidden mb-1.5">
					<div class="h-full bg-linear-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-300" style="width: {(cardsUploaded / players.length) * 100}%"></div>
				</div>
				<p class="text-[11px] text-neutral-400 font-medium mb-3.5">{cardsUploaded}/{players.length} ID cards uploaded</p>

				<!-- Player List -->
				<div class="space-y-2 mb-4">
					{#each players as player, i}
						<PlayerRow 
							{player}
							index={i}
							canRemove={players.length > 5}
							onCardChange={(e) => handlePlayerCardChange(i, e)}
							onRemoveCard={() => removePlayerCard(i)}
							onRemove={() => removePlayer(i)}
						/>
					{/each}

					{#if players.length < 10}
						<button type="button" onclick={addPlayer} class="w-full py-2.5 border-2 border-dashed border-neutral-300 rounded-xl bg-transparent font-poppins text-sm font-semibold text-neutral-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
							Add Player
						</button>
					{/if}
				</div>

				<!-- Officials -->
				<div class="pt-5 border-t border-neutral-100">
					<h3 class="font-montserrat text-xs font-extrabold text-neutral-600 uppercase tracking-wide mb-3.5">Team Officials</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each officials as official, i}
							<div class="space-y-1.5">
								<label for="official-{i}" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">Official {i + 1}</label>
								<input id="official-{i}" type="text" bind:value={officials[i]} required placeholder="Official name" class="w-full px-3.5 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white" />
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Section 3: Payment -->
			<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-6">
				<div class="flex items-start gap-3.5 mb-5">
					<div class="w-9 h-9 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-lg shadow-indigo-200 flex-shrink-0">03</div>
					<div>
						<h2 class="font-montserrat text-base font-extrabold text-neutral-900">Documents & Payment</h2>
						<p class="text-xs text-neutral-400 mt-0.5">Player ID cards are uploaded per-player above. Complete payment before submitting.</p>
					</div>
				</div>

				<div class="flex flex-col md:flex-row gap-0 bg-indigo-50 border-2 border-indigo-200 rounded-2xl overflow-hidden">
					<div class="flex-1 bg-indigo-100 p-5">
						<p class="text-[11px] font-poppins font-bold text-indigo-600 uppercase tracking-wide mb-1.5">Registration Fee</p>
						<p class="font-montserrat text-2xl font-black text-indigo-600 mb-0.5">Rp {new Intl.NumberFormat('id-ID').format(settings.registrationFee)}</p>
						<p class="text-xs text-neutral-500">per team</p>
					</div>
					<div class="w-px bg-indigo-200"></div>
					<div class="flex-1 bg-white p-5">
						<p class="text-[11px] font-poppins font-bold text-indigo-600 uppercase tracking-wide mb-1.5">Transfer to</p>
						<p class="font-montserrat text-base font-extrabold text-neutral-900 mb-1">{settings.bankName}</p>
						<p class="font-montserrat text-xl font-black text-indigo-600 tracking-wide mb-1">{settings.accountNumber}</p>
						<p class="text-[11px] text-neutral-500 font-semibold">A/N {settings.accountName}</p>
					</div>
				</div>
			</div>

			<!-- Submit Button -->
			<button type="submit" disabled={submissionStatus === 'submitting'} class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-poppins font-bold text-base rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5">
				{#if submissionStatus === 'submitting'}
					<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
					Submitting…
				{:else}
					Submit Registration
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
				{/if}
			</button>
		</form>
	</main>
</div>

<!-- Success Overlay -->
{#if submissionStatus === 'success'}
	<div class="fixed inset-0 z-50 bg-neutral-50/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-400">
		<div class="bg-white rounded-3xl border border-neutral-200 p-11 max-w-md w-full text-center shadow-2xl">
			<div class="w-20 h-20 bg-linear-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-300">
				<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
			</div>
			<h3 class="font-montserrat text-3xl font-black text-neutral-900 mb-3">Registration Sent!</h3>
			<p class="text-sm text-neutral-600 leading-relaxed mb-8">Thank you for registering. Our committee will verify your documents within 24 hours. Please keep your WhatsApp active.</p>
			<a href="/" class="block py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-poppins font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200">Back to Home</a>
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

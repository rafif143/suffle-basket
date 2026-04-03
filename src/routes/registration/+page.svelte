<script>
	import { onMount } from 'svelte';
	import { settingsService, registrationService } from '$lib/services';
	import { NotificationModal, PublicNavbar } from '$lib/components/ui';
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
	let showPaymentGuide = $state(true);

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
		if (players.length < 12) players = [...players, { name: '', card: null }];
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

	function closePaymentGuide() {
		showPaymentGuide = false;
	}

	function getWhatsAppLink(message = '') {
		const number = settings.whatsappContact.replace(/[^0-9]/g, '');
		const waNumber = number.startsWith('0') ? '62' + number.slice(1) : number;
		const text = encodeURIComponent(message || 'Halo Admin, saya ingin konfirmasi pendaftaran tim untuk Yadika Cup 2026.');
		return `https://wa.me/${waNumber}?text=${text}`;
	}
</script>

<svelte:head>
	<title>Registration | Yadika Cup</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-[#0f1123] via-[#1a1d35] to-[#0f1123] flex flex-col">
	<!-- Hero Header -->
	<header class="relative overflow-hidden">
		<!-- Background decoration -->
		<div class="absolute inset-0 bg-linear-to-br from-indigo-600/20 via-purple-600/10 to-transparent pointer-events-none"></div>
		<div class="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

		<div class="relative px-4 pt-5 pb-4 flex flex-col items-center text-center max-w-2xl mx-auto sm:px-6 sm:pt-7 sm:pb-6">
			<!-- Logo / Brand -->
			<div class="flex items-center gap-2 mb-3">
				
				<span class="font-montserrat font-black text-[10px] text-white/60 tracking-widest uppercase sm:text-sm">Yadika Cup 2026</span>
			</div>
			<h1 class="font-montserrat text-xl font-black text-white leading-tight sm:text-2xl">
				Pendaftaran Tim <span class="text-white font-semibold">— {level} {gender}</span>
			</h1>
		</div>

		<!-- Category Tabs -->
		<div class="relative px-3 pb-4 flex justify-center sm:px-6 sm:pb-5">
			<div class="flex bg-white/10 border border-white/15 rounded-xl p-0.5 gap-0.5 w-full max-w-2xl sm:rounded-2xl sm:p-1 sm:gap-1">
				{#each [
					{ label: 'SMA Putra', lv: 'SMA', gd: 'Putra' },
					{ label: 'SMA Putri', lv: 'SMA', gd: 'Putri' },
					{ label: 'SMP Putra', lv: 'SMP', gd: 'Putra' },
					{ label: 'SMP Putri', lv: 'SMP', gd: 'Putri' }
				] as tab}
					{@const isActive = level === tab.lv && gender === tab.gd}
					<button
						type="button"
						onclick={() => { level = tab.lv; gender = tab.gd; }}
						class="flex-1 py-2 rounded-lg font-poppins text-[10px] font-semibold transition-all sm:py-2.5 sm:rounded-xl sm:text-xs
							{isActive
								? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
								: 'text-white/50 hover:text-white hover:bg-white/5'}"
					>
						{tab.label}
					</button>
				{/each}
			</div>
		</div>
	</header>

	<!-- Form -->
	<main class="flex-1 px-3 py-5 bg-neutral-50/95 sm:px-6 sm:py-8">
		<form onsubmit={handleSubmit} class="max-w-3xl mx-auto space-y-3.5 sm:space-y-5">

			<!-- Section 1: School Info -->
			<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-4 sm:p-6">
				<div class="flex items-start gap-3.5 mb-5">
					<div class="w-9 h-9 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-lg shadow-indigo-200 flex-shrink-0">01</div>
					<div>
						<h2 class="font-montserrat text-sm font-extrabold text-neutral-900 sm:text-base">Informasi Sekolah</h2>
						<p class="text-[10px] text-neutral-400 mt-0.5 sm:text-xs">Data sekolah dan kontak penanggung jawab</p>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="school-name" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">Nama Sekolah</label>
						<input id="school-name" type="text" bind:value={schoolName} required placeholder="cth. SMAN 70 Jakarta" class="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white sm:px-3.5" />
					</div>

					<div class="space-y-1.5">
						<label for="whatsapp" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">Kontak WhatsApp</label>
						<div class="relative">
							<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-600 pointer-events-none">+62</span>
							<input id="whatsapp" type="tel" bind:value={whatsapp} required placeholder="81234567890" class="w-full pl-12 pr-3.5 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white" />
						</div>
					</div>

					<div class="md:col-span-2 space-y-1.5">
						<label for="address" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">Alamat Sekolah</label>
						<textarea id="address" bind:value={schoolAddress} required rows="2" placeholder="Alamat lengkap sekolah..." class="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none resize-vertical min-h-[60px] transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white sm:px-3.5 sm:min-h-[80px]"></textarea>
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
			<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-4 sm:p-6">
				<div class="flex items-start gap-3.5 mb-5">
					<div class="w-9 h-9 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-lg shadow-indigo-200 flex-shrink-0">02</div>
					<div class="flex-1">
						<h2 class="font-montserrat text-sm font-extrabold text-neutral-900 sm:text-base">Pemain & Official</h2>
						<p class="text-[10px] text-neutral-400 mt-0.5 sm:text-xs">Min 5 · Max 12 pemain. Upload kartu pelajar (max 2MB).</p>
					</div>
					<div class="flex items-baseline gap-0.5">
						<span class="font-montserrat text-2xl font-black text-indigo-600">{players.length}</span>
						<span class="text-sm font-semibold text-neutral-400">/12</span>
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

					{#if players.length < 12}
						<button type="button" onclick={addPlayer} class="w-full py-2.5 border-2 border-dashed border-neutral-300 rounded-xl bg-transparent font-poppins text-sm font-semibold text-neutral-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-all flex items-center justify-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
							Tambah Pemain
						</button>
					{/if}
				</div>

				<!-- Officials -->
				<div class="pt-5 border-t border-neutral-100">
					<h3 class="font-montserrat text-xs font-extrabold text-neutral-600 uppercase tracking-wide mb-3.5">Official Tim</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each officials as official, i}
							<div class="space-y-1.5">
								<label for="official-{i}" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">Official {i + 1}</label>
								<input id="official-{i}" type="text" bind:value={officials[i]} required placeholder="Nama official" class="w-full px-3 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white sm:px-3.5" />
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Section 3: Payment -->
			<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-4 sm:p-6">
				<div class="flex items-start gap-3.5 mb-5">
					<div class="w-9 h-9 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-lg shadow-indigo-200 shrink-0">03</div>
					<div>
						<h2 class="font-montserrat text-sm font-extrabold text-neutral-900 sm:text-base">Dokumen & Pembayaran</h2>
						<p class="text-[10px] text-neutral-400 mt-0.5 sm:text-xs">Kartu pelajar di-upload per pemain di atas. Selesaikan pembayaran sebelum submit.</p>
					</div>
				</div>

				<div class="flex flex-col gap-0 bg-indigo-50 border-2 border-indigo-200 rounded-xl overflow-hidden sm:rounded-2xl">
					<div class="bg-indigo-100 p-4 sm:p-5">
						<p class="text-[11px] font-poppins font-bold text-indigo-600 uppercase tracking-wide mb-1">Biaya Pendaftaran</p>
						<p class="font-montserrat text-xl font-black text-indigo-600 mb-0.5 sm:text-2xl">Rp {new Intl.NumberFormat('id-ID').format(settings.registrationFee)}</p>
						<p class="text-[10px] text-neutral-500 sm:text-xs">per tim</p>
					</div>
					<div class="h-px bg-indigo-200"></div>
					<div class="bg-white p-4 sm:p-5">
						<p class="text-[11px] font-poppins font-bold text-indigo-600 uppercase tracking-wide mb-1">Transfer ke</p>
						<p class="font-montserrat text-sm font-extrabold text-neutral-900 mb-0.5 sm:text-base sm:mb-1">{settings.bankName}</p>
						<p class="font-montserrat text-lg font-black text-indigo-600 tracking-wide mb-0.5 sm:text-xl sm:mb-1">{settings.accountNumber}</p>
						<p class="text-[11px] text-neutral-500 font-semibold">A/N {settings.accountName}</p>
					</div>
				</div>
			</div>

			<!-- Submit Button -->
			<button type="submit" disabled={submissionStatus === 'submitting'} class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-poppins font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-200 active:translate-y-0 flex items-center justify-center gap-2.5 sm:py-4 sm:text-base sm:rounded-2xl">
				{#if submissionStatus === 'submitting'}
					<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
					Mengirim...
				{:else}
					Kirim Pendaftaran
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
				{/if}
			</button>
		</form>
	</main>
</div>

<!-- Success Overlay -->
{#if submissionStatus === 'success'}
	<div class="fixed inset-0 z-50 bg-neutral-50/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-400">
		<div class="bg-white rounded-3xl border border-neutral-200 p-8 max-w-md w-full text-center shadow-2xl sm:p-11">
			<div class="w-16 h-16 bg-linear-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-300 sm:w-20 sm:h-20 sm:mb-6">
				<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
			</div>
			<h3 class="font-montserrat text-2xl font-black text-neutral-900 mb-2 sm:text-3xl sm:mb-3">Pendaftaran Terkirim!</h3>
			<p class="text-sm text-neutral-600 leading-relaxed mb-6 sm:mb-8">Terima kasih telah mendaftar. Panitia akan memverifikasi dokumen kamu dalam 1x24 jam. Pastikan WhatsApp kamu aktif.</p>
			<a href="/" class="block py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-poppins font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200">Kembali ke Beranda</a>
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

<!-- Payment Guide Modal -->
{#if showPaymentGuide}
	<div class="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Panduan Pendaftaran">
		<!-- Backdrop -->
		<button class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={closePaymentGuide} aria-label="Tutup panduan"></button>

		<!-- Modal Content -->
		<div class="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto sm:rounded-3xl sm:max-h-[85vh]">
			<!-- Header -->
			<div class="relative bg-linear-to-br from-indigo-600 via-indigo-700 to-purple-700 px-7 pt-7 pb-6 overflow-hidden">
				<div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
				<div class="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
				<div class="relative">
					<div class="flex items-center gap-2.5 mb-2">
						<div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
						</div>
						<span class="font-poppins text-[11px] font-bold text-white/60 uppercase tracking-wider">Yadika Cup 2026</span>
					</div>
					<h2 class="font-montserrat text-2xl font-black text-white leading-tight">Panduan Pendaftaran</h2>
					<p class="text-sm text-indigo-200 mt-1">Ikuti langkah-langkah berikut untuk mendaftarkan tim kamu</p>
				</div>
			</div>

			<!-- Steps -->
			<div class="px-7 py-6 space-y-1">
				<!-- Step 1 -->
				<div class="flex items-start gap-4 p-3 rounded-xl hover:bg-indigo-50/50 transition-colors">
					<div class="w-10 h-10 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-md shadow-indigo-200 flex-shrink-0">1</div>
					<div class="pt-1.5">
						<h3 class="font-poppins text-sm font-bold text-neutral-900">Isi Data Pendaftaran</h3>
						<p class="text-xs text-neutral-500 mt-0.5">Lengkapi formulir data sekolah, pemain, dan official di halaman ini</p>
					</div>
				</div>

				<!-- Connector -->
				<div class="ml-[18px] w-0.5 h-3 bg-neutral-200 rounded-full"></div>

				<!-- Step 2 -->
				<div class="flex items-start gap-4 p-3 rounded-xl hover:bg-indigo-50/50 transition-colors">
					<div class="w-10 h-10 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-md shadow-indigo-200 flex-shrink-0">2</div>
					<div class="pt-1.5">
						<h3 class="font-poppins text-sm font-bold text-neutral-900">Transfer Biaya Pendaftaran</h3>
						<p class="text-xs text-neutral-500 mt-0.5">Transfer ke rekening yang tertera di bagian bawah formulir sebesar <span class="font-bold text-indigo-600">Rp {new Intl.NumberFormat('id-ID').format(settings.registrationFee)}</span></p>
					</div>
				</div>

				<!-- Connector -->
				<div class="ml-[18px] w-0.5 h-3 bg-neutral-200 rounded-full"></div>

				<!-- Step 3 -->
				<div class="flex items-start gap-4 p-3 rounded-xl hover:bg-indigo-50/50 transition-colors">
					<div class="w-10 h-10 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-md shadow-indigo-200 flex-shrink-0">3</div>
					<div class="pt-1.5">
						<h3 class="font-poppins text-sm font-bold text-neutral-900">Screenshot Bukti Transfer</h3>
						<p class="text-xs text-neutral-500 mt-0.5">Simpan bukti transfer sebagai screenshot untuk dikirim ke admin</p>
					</div>
				</div>

				<!-- Connector -->
				<div class="ml-[18px] w-0.5 h-3 bg-neutral-200 rounded-full"></div>

				<!-- Step 4 -->
				<div class="flex items-start gap-4 p-3 rounded-xl hover:bg-emerald-50/50 transition-colors">
					<div class="w-10 h-10 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-md shadow-emerald-200 flex-shrink-0">4</div>
					<div class="pt-1.5">
						<h3 class="font-poppins text-sm font-bold text-neutral-900">Hubungi Admin via WhatsApp</h3>
						<p class="text-xs text-neutral-500 mt-0.5">Kirim bukti transfer ke admin untuk konfirmasi pendaftaran tim kamu</p>
					</div>
				</div>

				<!-- Connector -->
				<div class="ml-[18px] w-0.5 h-3 bg-neutral-200 rounded-full"></div>

				<!-- Step 5 -->
				<div class="flex items-start gap-4 p-3 rounded-xl hover:bg-amber-50/50 transition-colors">
					<div class="w-10 h-10 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
					</div>
					<div class="pt-1.5">
						<h3 class="font-poppins text-sm font-bold text-neutral-900">Selesai!</h3>
						<p class="text-xs text-neutral-500 mt-0.5">Pendaftaran kamu akan diverifikasi oleh panitia dalam 1x24 jam</p>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="px-7 pb-7">
				<button
					onclick={closePaymentGuide}
					class="w-full py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-poppins font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 flex items-center justify-center gap-2"
				>
					Mulai Pendaftaran
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Floating Buttons -->
<div class="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2.5 sm:bottom-6 sm:right-6 sm:gap-3">
	<!-- Tata Cara Pembayaran Button -->
	<button
		onclick={() => showPaymentGuide = true}
		class="flex items-center gap-2 bg-white hover:bg-indigo-50 text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400 pl-3 pr-4 py-2.5 rounded-full shadow-lg shadow-indigo-100/50 transition-all active:scale-95 sm:pl-4 sm:pr-5 sm:py-3 sm:gap-2.5"
		aria-label="Tata Cara Pembayaran"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-5 sm:h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
		<span class="font-poppins text-xs font-bold sm:text-sm">Tata Cara Pendaftaran</span>
	</button>

	<!-- WhatsApp Button -->
	{#if settings.whatsappContact}
		<a
			href={getWhatsAppLink()}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg shadow-emerald-300/40 transition-all active:scale-95 sm:pl-4 sm:pr-5 sm:py-3 sm:gap-2.5"
			aria-label="Hubungi Admin via WhatsApp"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" class="sm:w-[22px] sm:h-[22px]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
			<span class="font-poppins text-xs font-bold sm:text-sm">Hubungi Admin</span>
		</a>
	{/if}
</div>

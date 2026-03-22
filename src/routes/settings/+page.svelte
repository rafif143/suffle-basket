<script>
	import { onMount } from 'svelte';
	import { storage } from '$lib/utils/storage.js';
	import { NotificationModal } from '$lib/components/ui';

	let bankName = $state('');
	let accountNumber = $state('');
	let accountName = $state('');
	let registrationFee = $state('');
	let whatsappNumber = $state('');

	let saveModal = $state({
		isOpen: false,
		title: 'Settings Saved',
		message: 'Your settings have been saved successfully.',
		type: 'success'
	});

	onMount(() => {
		loadSettings();
	});

	function loadSettings() {
		const settings = storage.get('tournament_settings') || {};
		bankName = settings.bankName || 'Bank BCA';
		accountNumber = settings.accountNumber || '123 456 7890';
		accountName = settings.accountName || 'Panitia Championship';
		registrationFee = settings.registrationFee || '350000';
		whatsappNumber = settings.whatsappNumber || '81234567890';
	}

	function handleSave(e) {
		e.preventDefault();
		const settings = {
			bankName,
			accountNumber,
			accountName,
			registrationFee,
			whatsappNumber
		};
		storage.set('tournament_settings', settings);
		saveModal.isOpen = true;
	}

	function formatCurrency(value) {
		return new Intl.NumberFormat('id-ID').format(value);
	}
</script>

<svelte:head>
	<title>Settings | Yadika Cup</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-neutral-50 via-white to-neutral-50/50 flex flex-col">
	<!-- Header -->
	<header class="bg-white/90 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
		<div class="px-8 py-5 flex items-center justify-between flex-wrap gap-4">
			<div>
				<h1 class="font-montserrat text-2xl font-extrabold text-neutral-900">Tournament Settings</h1>
				<p class="text-xs text-neutral-400 mt-1">Configure payment and contact information</p>
			</div>
			<span class="bg-indigo-100 text-indigo-700 border border-indigo-200 font-poppins text-[11px] font-bold px-3 py-1.5 rounded-full">Admin Mode</span>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 px-8 py-7 overflow-hidden">
		<form onsubmit={handleSave} class="h-full flex flex-col">
			
			<!-- Grid Layout: 2 Columns -->
			<div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 overflow-hidden">
				
				<!-- Left Column -->
				<div class="space-y-5 overflow-y-auto pr-2">
					<!-- Section 1: Payment Settings -->
					<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-6">
						<div class="flex items-start gap-3.5 mb-5">
							<div class="w-9 h-9 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-lg shadow-indigo-200 shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
							</div>
							<div>
								<h2 class="font-montserrat text-base font-extrabold text-neutral-900">Payment Information</h2>
								<p class="text-xs text-neutral-400 mt-0.5">Bank account details for registration payment</p>
							</div>
						</div>

						<div class="space-y-4">
							<div class="space-y-1.5">
								<label for="bank-name" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">Bank Name</label>
								<input 
									id="bank-name" 
									type="text" 
									bind:value={bankName} 
									required 
									placeholder="e.g. Bank BCA" 
									class="w-full px-3.5 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white" 
								/>
							</div>

							<div class="space-y-1.5">
								<label for="account-number" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">Account Number</label>
								<input 
									id="account-number" 
									type="text" 
									bind:value={accountNumber} 
									required 
									placeholder="e.g. 123 456 7890" 
									class="w-full px-3.5 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white" 
								/>
							</div>

							<div class="space-y-1.5">
								<label for="account-name" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">Account Name</label>
								<input 
									id="account-name" 
									type="text" 
									bind:value={accountName} 
									required 
									placeholder="e.g. Panitia Championship" 
									class="w-full px-3.5 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white" 
								/>
							</div>
						</div>
					</div>

					<!-- Section 2: Registration Fee -->
					<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-6">
						<div class="flex items-start gap-3.5 mb-5">
							<div class="w-9 h-9 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-lg shadow-indigo-200 shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
							</div>
							<div>
								<h2 class="font-montserrat text-base font-extrabold text-neutral-900">Registration Fee</h2>
								<p class="text-xs text-neutral-400 mt-0.5">Set the registration fee amount per team</p>
							</div>
						</div>

						<div class="space-y-1.5">
							<label for="registration-fee" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">Fee Amount (IDR)</label>
							<div class="relative">
								<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-600 pointer-events-none">Rp</span>
								<input 
									id="registration-fee" 
									type="number" 
									bind:value={registrationFee} 
									required 
									placeholder="350000" 
									class="w-full pl-12 pr-3.5 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white" 
								/>
							</div>
							{#if registrationFee}
								<p class="text-xs text-neutral-500 mt-1.5">Preview: <span class="font-semibold text-indigo-600">Rp {formatCurrency(registrationFee)}</span></p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Right Column -->
				<div class="space-y-5 overflow-y-auto pr-2">
					<!-- Section 3: Contact Settings -->
					<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-6">
						<div class="flex items-start gap-3.5 mb-5">
							<div class="w-9 h-9 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-montserrat text-sm font-black text-white shadow-lg shadow-indigo-200 shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
							</div>
							<div>
								<h2 class="font-montserrat text-base font-extrabold text-neutral-900">Contact Information</h2>
								<p class="text-xs text-neutral-400 mt-0.5">WhatsApp number for participant inquiries</p>
							</div>
						</div>

						<div class="space-y-1.5">
							<label for="whatsapp" class="text-[11px] font-poppins font-bold text-neutral-600 uppercase tracking-wide">WhatsApp Number</label>
							<div class="relative">
								<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-600 pointer-events-none">+62</span>
								<input 
									id="whatsapp" 
									type="tel" 
									bind:value={whatsappNumber} 
									required 
									placeholder="81234567890" 
									class="w-full pl-12 pr-3.5 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-poppins text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white" 
								/>
							</div>
							{#if whatsappNumber}
								<p class="text-xs text-neutral-500 mt-1.5">Preview: <span class="font-semibold text-indigo-600">+62 {whatsappNumber}</span></p>
							{/if}
						</div>
					</div>

					<!-- Preview Card -->
					<div class="bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-6">
						<div class="flex items-start gap-3 mb-4">
							<div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
							</div>
							<div>
								<h3 class="font-montserrat text-sm font-extrabold text-neutral-900">Settings Preview</h3>
								<p class="text-xs text-neutral-500 mt-0.5">How it will appear on registration page</p>
							</div>
						</div>

						<div class="bg-white rounded-xl p-4 space-y-3">
							<div class="flex items-center justify-between pb-3 border-b border-neutral-100">
								<span class="text-xs font-poppins font-semibold text-neutral-500">Registration Fee</span>
								<span class="font-montserrat text-lg font-black text-indigo-600">Rp {formatCurrency(registrationFee || '0')}</span>
							</div>
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<span class="text-xs font-poppins font-semibold text-neutral-500">Bank</span>
									<span class="text-xs font-poppins font-bold text-neutral-900">{bankName || '-'}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-xs font-poppins font-semibold text-neutral-500">Account</span>
									<span class="text-xs font-montserrat font-black text-indigo-600">{accountNumber || '-'}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-xs font-poppins font-semibold text-neutral-500">Name</span>
									<span class="text-xs font-poppins font-bold text-neutral-900">{accountName || '-'}</span>
								</div>
								<div class="flex items-center justify-between pt-2 border-t border-neutral-100">
									<span class="text-xs font-poppins font-semibold text-neutral-500">WhatsApp</span>
									<span class="text-xs font-poppins font-bold text-neutral-900">+62 {whatsappNumber || '-'}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Save Button - Fixed at bottom -->
			<div class="flex items-center justify-end gap-3 pt-5 border-t border-neutral-200 mt-5">
				<button 
					type="button" 
					onclick={loadSettings}
					class="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-poppins font-semibold text-sm rounded-xl transition-colors"
				>
					Reset
				</button>
				<button 
					type="submit" 
					class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-poppins font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
					Save Settings
				</button>
			</div>
		</form>
	</main>
</div>

<NotificationModal
	isOpen={saveModal.isOpen}
	title={saveModal.title}
	message={saveModal.message}
	type="success"
	onConfirm={() => saveModal.isOpen = false}
	onClose={() => saveModal.isOpen = false}
/>

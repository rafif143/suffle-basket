<script>
	import './layout.css';
	import { page } from '$app/stores';
	
	let isSidebarOpen = $state(true);
	
	const navItems = [
		{ href: '/draw', label: 'Draw', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12' },
		{ href: '/schedule', label: 'Schedule', icon: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18' },
		{ href: '/management', label: 'Management', icon: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
		{ href: '/registration', label: 'Registration', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
		{ href: '/settings', label: 'Settings', icon: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' }
	];
</script>

<div class="flex h-screen overflow-hidden bg-neutral-50">
	<!-- Sidebar -->
	<aside class="fixed left-0 top-0 h-full bg-[#1a1d2e] flex flex-col transition-all duration-300 ease-out z-50 overflow-hidden {isSidebarOpen ? 'w-60' : 'w-[72px]'}">
		<!-- Brand -->
		<div class="flex items-center gap-3 px-4 py-5 border-b border-white/5 min-h-[72px]">
			<div class="flex-shrink-0 w-9 h-9 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<rect width="12" height="12" x="2" y="10" rx="2" ry="2"/>
					<path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/>
					<path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/>
				</svg>
			</div>
			{#if isSidebarOpen}
				<div class="flex flex-col leading-none overflow-hidden">
					<span class="font-montserrat font-black text-[15px] text-white tracking-wider whitespace-nowrap">YADIKA</span>
					<span class="text-[10px] text-white/40 font-medium mt-0.5 whitespace-nowrap">Tournament</span>
				</div>
			{/if}
		</div>
		
		<!-- Toggle Button -->
		<button 
			class="absolute -right-3 top-[76px] w-6 h-6 bg-white border-2 border-neutral-200 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-neutral-50 hover:shadow-lg transition-all z-[60] text-neutral-500"
			onclick={() => isSidebarOpen = !isSidebarOpen} 
			aria-label="Toggle sidebar"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300 {isSidebarOpen ? '' : 'rotate-180'}">
				<path d="m15 18-6-6 6-6"/>
			</svg>
		</button>
		
		<!-- Navigation -->
		<nav class="flex-1 px-2.5 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
			{#each navItems as item}
				{@const isActive = $page.url.pathname === item.href}
				<a 
					href={item.href} 
					class="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline text-[13.5px] font-medium transition-all relative whitespace-nowrap {isActive ? 'bg-indigo-600/20 text-white' : 'text-white/50 hover:bg-white/7 hover:text-white/85'} {!isSidebarOpen ? 'justify-center px-2.5' : ''}"
				>
					<span class="flex-shrink-0 flex items-center {isActive ? 'text-indigo-300' : ''}">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d={item.icon}/>
						</svg>
					</span>
					{#if isSidebarOpen}
						<span class="flex-1">{item.label}</span>
					{/if}
					{#if isActive && isSidebarOpen}
						<span class="w-1.5 h-1.5 rounded-full bg-indigo-300 flex-shrink-0"></span>
					{/if}
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		{#if isSidebarOpen}
			<div class="px-5 py-3.5 border-t border-white/5">
				<span class="text-[11px] text-white/25 font-medium">Yadika Cup 2025</span>
			</div>
		{/if}
	</aside>
	
	<!-- Main Content -->
	<main class="flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-out {isSidebarOpen ? 'ml-60' : 'ml-[72px]'}">
		<slot />
	</main>
</div>

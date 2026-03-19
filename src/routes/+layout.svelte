<script>
	import './layout.css';
	import { page } from '$app/stores';
	
	let isSidebarOpen = $state(true);
	
	const navItems = [
		{ href: '/', label: 'Draw', icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
		{ href: '/schedule', label: 'Schedule', icon: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18' },
		{ href: '/management', label: 'Management', icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
		{ href: '/registration', label: 'Registration', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' }
	];
</script>

<div class="flex h-screen bg-neutral-50 overflow-hidden">
	<!-- Sidebar -->
	<aside class="fixed left-0 top-0 h-full bg-white border-r border-neutral-200 shadow-lg transition-all duration-300 z-50 {isSidebarOpen ? 'w-64' : 'w-20'}">
		<!-- Logo -->
		<div class="flex items-center justify-between p-6 border-b border-neutral-100">
			{#if isSidebarOpen}
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
					</div>
					<div>
						<h1 class="font-montserrat font-black text-lg text-neutral-900 leading-none">YADIKA</h1>
						<p class="font-poppins text-xs text-neutral-500 font-medium">Tournament</p>
					</div>
				</div>
			{:else}
				<div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
				</div>
			{/if}
		</div>
		
		<!-- Toggle Button -->
		<button 
			onclick={() => isSidebarOpen = !isSidebarOpen}
			class="absolute -right-3 top-20 w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center shadow-md hover:bg-neutral-50 transition-colors"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform {isSidebarOpen ? '' : 'rotate-180'}"><path d="m15 18-6-6 6-6"/></svg>
		</button>
		
		<!-- Navigation -->
		<nav class="p-4 space-y-2">
			{#each navItems as item}
				{@const isActive = $page.url.pathname === item.href}
				<a 
					href={item.href}
					class="flex items-center gap-3 px-4 py-3 rounded-xl font-poppins font-medium text-sm transition-all {isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-neutral-600 hover:bg-neutral-100'} {!isSidebarOpen && 'justify-center'}"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d={item.icon}/>
					</svg>
					{#if isSidebarOpen}
						<span>{item.label}</span>
					{/if}
				</a>
			{/each}
		</nav>
	</aside>
	
	<!-- Main Content -->
	<main class="flex-1 overflow-auto transition-all duration-300" style="margin-left: {isSidebarOpen ? '16rem' : '5rem'}">
		<slot />
	</main>
</div>

<style>
	:global(body) {
		font-family: 'Poppins', sans-serif;
		margin: 0;
		padding: 0;
	}
	
	:global(h1, h2, h3, h4, h5, h6) {
		font-family: 'Montserrat', sans-serif;
	}
</style>

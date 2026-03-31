<script>
	import { page } from '$app/stores';
</script>

<nav class="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
	<div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
		<a href="/" class="flex items-center gap-3" aria-label="Yadika Cup Home">
			<div class="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
				<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<rect width="12" height="12" x="2" y="10" rx="2" ry="2"/>
					<path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/>
					<path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/>
				</svg>
			</div>
			<div>
				<h1 class="font-montserrat font-black text-xl tracking-tighter text-white">YADIKA <span class="text-indigo-400">CUP</span></h1>
				<p class="text-[10px] text-white/40 font-poppins uppercase tracking-[0.2em] -mt-1 font-bold">Championship 2026</p>
			</div>
		</a>
		
		<div class="hidden lg:flex items-center gap-8 font-poppins text-xs font-bold uppercase tracking-wider text-white">
			<a href="/live-scores" class="transition-colors {$page.url.pathname === '/live-scores' ? 'text-indigo-400' : 'text-white/60 hover:text-white'}">Live Scores</a>
			<a href="/schedule" class="transition-colors {$page.url.pathname === '/schedule' ? 'text-indigo-400' : 'text-white/60 hover:text-white'}">Schedule</a>
			<a href="/draw" class="transition-colors {$page.url.pathname === '/draw' ? 'text-indigo-400' : 'text-white/60 hover:text-white'}">Bracket</a>
			<a href="/registration" class="transition-colors {$page.url.pathname === '/registration' ? 'text-indigo-400' : 'text-white/60 hover:text-white'}">Registration</a>
			<div class="h-4 w-px bg-white/10"></div>
			<a href="/login" class="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">Admin Panel</a>
		</div>

		<!-- Mobile trigger placeholder if needed -->
		<div class="lg:hidden">
			<button class="p-2 text-white/60" aria-label="Open Menu">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
			</button>
		</div>
	</div>
</nav>

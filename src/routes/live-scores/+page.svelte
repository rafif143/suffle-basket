<script>
    import { onMount } from 'svelte';
    import { scheduleService, registrationService } from '$lib/services';
    import { MatchCard } from '$lib/components/features';
    import { PublicNavbar } from '$lib/components/ui';
    import { apiCache } from '$lib/utils/cache.js';
    import { fade, fly, scale } from 'svelte/transition';

    let activeCategory = $state('ALL');
    let matchScores = $state({});
    let scheduleData = $state([]);
    let loading = $state(true);
    let lastUpdated = $state(new Date());
    let teamLogosMap = $state({});

    // Logic filter & grouping tetap sama namun dipastikan performanya stabil
    let activeLevel = $derived(activeCategory === 'ALL' ? 'ALL' : activeCategory.split('_')[0]);
    let activeGender = $derived(
        activeCategory === 'ALL' 
            ? 'ALL' 
            : activeCategory.split('_')[1].charAt(0).toUpperCase() + activeCategory.split('_')[1].slice(1).toLowerCase()
    );

    let filteredSchedule = $derived(
        scheduleData.filter(m => {
            if (activeCategory === 'ALL') return true;
            return m.category.trim() === `${activeLevel} ${activeGender}`;
        })
    );

    let groupedSchedule = $derived.by(() => {
        const groups = {};
        filteredSchedule.forEach(match => {
            if (!groups[match.day]) groups[match.day] = [];
            groups[match.day].push(match);
        });
        return Object.keys(groups)
            .map(day => ({ day: parseInt(day), matches: groups[day] }))
            .sort((a, b) => a.day - b.day);
    });

    async function loadAllData() {
        try {
            if (scheduleData.length === 0) loading = true;
            const data = await scheduleService.getSchedule();
            scheduleData = data.map(match => {
                const parts = match.category.split(' ');
                return { ...match, level: parts[0], gender: parts[1] };
            });
            matchScores = await scheduleService.getScores();
            
            // Fetch logos for all teams
            const registrations = await registrationService.getAll();
            teamLogosMap = Object.fromEntries(registrations.map(r => [r.school_name, r.logo_url]));
            
            lastUpdated = new Date();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadAllData();
        const interval = setInterval(() => {
            apiCache.clear();
            loadAllData();
        }, 30000);
        return () => clearInterval(interval);
    });

    function generateMatchKey(match) {
        const match_number = match.match_number || match.matchStrId?.replace(/[A-Z]/g, '');
        let prefix = match.matchStrId?.startsWith('M') ? `M${String(match_number).padStart(2, '0')}` : match.matchStrId;
        return `${match.day}-${prefix}-${match.category.toLowerCase().replace(' ', '-')}`;
    }

    const getMatchScore = (match) => matchScores[generateMatchKey(match)] || null;
    const isMatchComplete = (match) => {
        const s = getMatchScore(match);
        return s && s.score1 !== undefined && s.score2 !== undefined;
    };
</script>

<svelte:head>
    <title>LIVE SCORE | Yadika Cup 2026</title>
</svelte:head>

<div class="min-h-screen bg-[#050507] text-slate-100 font-sans selection:bg-indigo-500/40 selection:text-white">
    <PublicNavbar />

    <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse"></div>
        <div class="absolute top-[20%] -right-[5%] w-[30%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
        <div class="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
    </div>

    <main class="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:pt-24 lg:pb-32">
        
        <header class="relative mb-20">
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div class="space-y-6">
                    
                    <h1 class="text-6xl md:text-8xl font-black tracking-tight uppercase italic leading-[1.0] pb-2">
                        Yadika <br /> 
                        <span class="inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-purple-400 py-2 pr-6">Cup 2026</span>
                    </h1>
                    
                    <p class="text-slate-400 max-w-lg text-lg font-medium leading-relaxed">
                        The ultimate battleground. Tracking every point, every set, and every champion in real-time.
                    </p>
                </div>

                <div class="flex flex-col items-start lg:items-end gap-3">
                    <div class="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-xl">
                        <span class="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Last Sync Time</span>
                        <span class="font-mono text-xl text-indigo-300 font-bold tracking-tighter">
                            {lastUpdated.toLocaleTimeString('id-ID', { hour12: false })} <small class="text-[10px] opacity-50">WIB</small>
                        </span>
                    </div>
                </div>
            </div>
        </header>

        <nav class="sticky top-6 z-50 mb-16">
            <div class="bg-[#0c0c10]/80 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl flex flex-wrap shadow-2xl overflow-x-auto no-scrollbar">
                {#each [
                    { id: 'ALL', label: 'All Matchups' },
                    { id: 'SMA_PUTRA', label: 'SMA Putra' },
                    { id: 'SMA_PUTRI', label: 'SMA Putri' },
                    { id: 'SMP_PUTRA', label: 'SMP Putra' },
                    { id: 'SMP_PUTRI', label: 'SMP Putri' }
                ] as cat}
                    <button
                        onclick={() => activeCategory = cat.id}
                        class="flex-1 min-w-[140px] py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 
                        {activeCategory === cat.id 
                            ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] scale-[1.02]' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'}"
                    >
                        {cat.label}
                    </button>
                {/each}
            </div>
        </nav>

        {#if loading && scheduleData.length === 0}
            <div class="flex flex-col items-center justify-center py-40 gap-8" in:fade>
                <div class="relative w-24 h-24">
                    <div class="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                    <div class="absolute inset-4 border-b-4 border-purple-500 rounded-full animate-spin-slow"></div>
                </div>
                <div class="text-center">
                    <h3 class="text-2xl font-black italic uppercase tracking-tighter">Synchronizing Data</h3>
                    <p class="text-indigo-400/50 text-sm font-mono mt-2 animate-pulse">Requesting secure stream...</p>
                </div>
            </div>
        {:else}
            <div class="space-y-32">
                {#if groupedSchedule.length === 0}
                    <div class="py-32 text-center bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-sm" in:scale>
                        <div class="text-6xl mb-6 opacity-20">⚽</div>
                        <h3 class="text-3xl font-black uppercase tracking-tighter">No Matches Scheduled</h3>
                        <p class="text-slate-500 mt-2">Adjust your filters to see other brackets.</p>
                        <button onclick={() => activeCategory = 'ALL'} class="mt-8 text-indigo-400 font-bold underline decoration-2 underline-offset-8">Return to Overview</button>
                    </div>
                {:else}
                    {#each groupedSchedule as dayGroup (dayGroup.day)}
                        <section class="group" in:fly={{ y: 50, duration: 800 }}>
                            <div class="flex items-center gap-8 mb-12">
                                <div class="flex flex-col">
                                    <span class="text-indigo-500 font-black tracking-[0.4em] text-[10px] uppercase ml-1">Timeline</span>
                                    <h2 class="text-5xl font-black italic tracking-tighter uppercase">Day {dayGroup.day}</h2>
                                </div>
                                <div class="h-[2px] flex-1 bg-gradient-to-r from-white/20 via-white/5 to-transparent"></div>
                                <div class="hidden md:block text-right">
                                    <span class="text-slate-500 text-sm font-mono uppercase tracking-widest">{dayGroup.matches.length} Matches Found</span>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                                {#each dayGroup.matches as match (match.id || match.matchStrId)}
                                    <div class="hover:scale-[1.02] transition-transform duration-500">
                                        <MatchCard
                                            {match}
                                            index={match.match_number - 1}
                                            level={match.level}
                                            gender={match.gender}
                                            isComplete={isMatchComplete(match)}
                                            score={getMatchScore(match)}
                                            onInputScore={null}
                                            logo1={teamLogosMap[match.team1]}
                                            logo2={teamLogosMap[match.team2]}
                                        />
                                    </div>
                                {/each}
                            </div>
                        </section>
                    {/each}
                {/if}
            </div>
        {/if}

    </main>

    <footer class="py-20 text-center opacity-30">
        <p class="font-mono text-[10px] tracking-[0.5em] uppercase">Built for Champions &bull; Yadika Cup 2026</p>
    </footer>
</div>

<style>
    :global(.no-scrollbar::-webkit-scrollbar) {
        display: none;
    }
    :global(.no-scrollbar) {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
    }
    .animate-spin-slow {
        animation: spin-slow 3s linear infinite;
    }
</style>
<script>
    let { matches = [], scores = {}, logos = {} } = $props();

    // Consistency check for match keys
    function generateMatchKey(match) {
        if (match.match_key) return match.match_key;
        const match_number = match.match_number || match.matchStrId?.replace(/[A-Z]/g, '');
        let prefix = match.matchStrId?.startsWith('M') ? `M${String(match_number).padStart(2, '0')}` : match.matchStrId;
        return `${match.day}-${prefix}-${match.category.toLowerCase().replace(' ', '-')}`;
    }

    // Group matches by rounds with better detection
    let rounds = $derived.by(() => {
        const roundNames = ['16 Besar', '8 Besar', 'Semi Final', 'Final'];
        const grouped = {
            '16 Besar': matches.filter(m => m.round === '16 Besar').sort((a, b) => a.match_number - b.match_number),
            '8 Besar': matches.filter(m => m.round === '8 Besar').sort((a, b) => a.match_number - b.match_number),
            'Semi Final': matches.filter(m => m.round === 'Semi Final').sort((a, b) => a.match_number - b.match_number),
            'Final': matches.filter(m => m.round === 'Final').sort((a, b) => a.match_number - b.match_number)
        };
        
        // Only return rounds that have matches
        return Object.entries(grouped)
            .filter(([_, matches]) => matches.length > 0)
            .map(([name, matches]) => ({ name, matches }));
    });

    const getMatchScore = (match) => scores[generateMatchKey(match)] || null;
    const isMatchComplete = (match) => {
        const s = getMatchScore(match);
        return s && s.score1 !== undefined && s.score2 !== undefined;
    };

    const getRoundLabel = (name) => {
        switch(name) {
            case '16 Besar': return 'Round of 16';
            case '8 Besar': return 'Quarter Finals';
            case 'Semi Final': return 'Semi Finals';
            case 'Final': return 'Grand Final';
            default: return name;
        }
    };
</script>

<div class="relative w-full overflow-x-auto pb-12 no-scrollbar">
    <div class="flex gap-4 md:gap-12 min-w-max px-4">
        {#each rounds as round, roundIdx}
            <div class="flex flex-col gap-8 w-64 md:w-80">
                <div class="sticky top-0 z-10 py-4 bg-[#050507]/80 backdrop-blur-md mb-4 border-b border-white/10">
                    <h4 class="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">{getRoundLabel(round.name)}</h4>
                    <p class="text-[10px] text-slate-500 font-mono mt-1">{round.matches.length} Matches</p>
                </div>

                <div class="flex flex-col justify-around h-full gap-6">
                    {#each round.matches as match (match.id || match.matchStrId)}
                        {@const score = getMatchScore(match)}
                        {@const complete = isMatchComplete(match)}
                        
                        <div class="relative group">
                            <!-- Match Box -->
                            <div class="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm transition-all duration-300 group-hover:border-indigo-500/50 group-hover:bg-white/10">
                                <div class="flex items-center justify-between mb-3">
                                    <span class="text-[10px] font-mono text-slate-500 font-bold tracking-tighter">#{match.matchStrId}</span>
                                    {#if complete}
                                        <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded-full">Finished</span>
                                    {/if}
                                </div>
                                
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between gap-4">
                                        <div class="flex items-center gap-2 min-w-0">
                                            <div class="w-6 h-6 rounded-full bg-white/10 overflow-hidden flex-shrink-0 border border-white/5">
                                                {#if logos[match.team1]}
                                                    <img src={logos[match.team1]} alt="" class="w-full h-full object-cover" />
                                                {:else}
                                                    <div class="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/20">?</div>
                                                {/if}
                                            </div>
                                            <span class="text-sm font-bold truncate {complete && score.score1 > score.score2 ? 'text-white' : 'text-slate-400'}">
                                                {match.team1 || 'TBD'}
                                            </span>
                                        </div>
                                        {#if complete}
                                            <span class="text-lg font-black font-mono {score.score1 > score.score2 ? 'text-indigo-400' : 'text-slate-600'}">
                                                {score.score1}
                                            </span>
                                        {/if}
                                    </div>
                                    
                                    <div class="flex items-center justify-between gap-4">
                                        <div class="flex items-center gap-2 min-w-0">
                                            <div class="w-6 h-6 rounded-full bg-white/10 overflow-hidden flex-shrink-0 border border-white/5">
                                                {#if logos[match.team2]}
                                                    <img src={logos[match.team2]} alt="" class="w-full h-full object-cover" />
                                                {:else}
                                                    <div class="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/20">?</div>
                                                {/if}
                                            </div>
                                            <span class="text-sm font-bold truncate {complete && score.score2 > score.score1 ? 'text-white' : 'text-slate-400'}">
                                                {match.team2 || 'TBD'}
                                            </span>
                                        </div>
                                        {#if complete}
                                            <span class="text-lg font-black font-mono {score.score2 > score.score1 ? 'text-indigo-400' : 'text-slate-600'}">
                                                {score.score2}
                                            </span>
                                        {/if}
                                    </div>
                                </div>
                            </div>

                            <!-- Connector Lines (Visual Only for now) -->
                            {#if roundIdx < rounds.length - 1}
                                <div class="absolute -right-6 md:-right-12 top-1/2 w-6 md:w-12 h-[2px] bg-gradient-to-r from-white/10 to-transparent"></div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
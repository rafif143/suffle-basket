<script>
	import { drawService } from '$lib/services';
	
	let {
		activeCategory,
		teams = $bindable([]),
		drawResults
	} = $props();
	
	let newTeamName = $state('');
	
	function addTeam(e) {
		if (e) e.preventDefault();
		const t = newTeamName.trim();
		if (t && teams.length < 16) {
			teams = [...teams, t];
			newTeamName = '';
			drawService.saveTeams(activeCategory, teams);
		}
	}
	
	function removeTeam(index) {
		teams = teams.filter((_, i) => i !== index);
		drawService.saveTeams(activeCategory, teams);
	}
</script>

<div class="bg-white/90 backdrop-blur-sm rounded-xl border border-neutral-200/50 p-6 shadow-sm h-full">
	<div class="mb-4">
		<h2 class="font-montserrat font-bold text-xl text-neutral-900">Participants</h2>
		<p class="font-poppins text-xs text-neutral-500 mt-1">{activeCategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Teams</p>
	</div>
	
	<form onsubmit={addTeam} class="mb-4 flex gap-2">
		<input
			type="text"
			bind:value={newTeamName}
			disabled={teams.length >= 16}
			class="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
			placeholder="Enter team name..."
		/>
		<button
			type="submit"
			disabled={teams.length >= 16 || newTeamName.trim() === ''}
			class="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-poppins font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Add
		</button>
	</form>
	
	<div class="space-y-2 max-h-[520px] overflow-y-auto pr-2">
		<div class="mb-2 text-right">
			<span class="text-xs font-poppins font-medium {teams.length === 16 ? 'text-indigo-600' : 'text-neutral-400'}">{teams.length}/16 Teams</span>
		</div>
		{#each teams as team, i}
			{@const isScheduled = drawResults.some(m => m.team1 === team || m.team2 === team)}
			<div class="flex items-center justify-between p-3 rounded-lg border {isScheduled ? 'border-indigo-100 bg-indigo-50/50' : 'border-neutral-100 bg-neutral-50'} hover:border-neutral-200 transition-colors">
				<div class="flex items-center gap-3 overflow-hidden">
					<span class="font-montserrat font-bold text-neutral-400 text-sm">{i + 1}</span>
					<div class="flex flex-col">
						<span class="font-poppins font-medium text-neutral-900 text-sm">{team}</span>
						{#if isScheduled}
							<span class="text-xs font-poppins text-indigo-600 flex items-center gap-1">
								<span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
								Scheduled
							</span>
						{/if}
					</div>
				</div>
				<button onclick={() => removeTeam(i)} class="text-neutral-300 hover:text-red-500 transition-colors" aria-label="Remove team">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
				</button>
			</div>
		{/each}
	</div>
</div>

<script>
	let {
		matches,
		onOpenScoreModal,
		isMatchComplete,
		getMatchScore
	} = $props();
</script>

<div class="bg-white/95 backdrop-blur-sm rounded-xl border border-neutral-200/50 shadow-sm overflow-hidden">
	<div class="overflow-x-auto">
		<table class="w-full">
			<thead class="bg-gradient-to-r from-indigo-50 to-white border-b border-neutral-200">
				<tr>
					<th class="px-4 py-3 text-left text-xs font-montserrat font-bold text-neutral-700 uppercase">Match</th>
					<th class="px-4 py-3 text-left text-xs font-montserrat font-bold text-neutral-700 uppercase">Time</th>
					<th class="px-4 py-3 text-left text-xs font-montserrat font-bold text-neutral-700 uppercase">Category</th>
					<th class="px-4 py-3 text-left text-xs font-montserrat font-bold text-neutral-700 uppercase">Home Team</th>
					<th class="px-4 py-3 text-center text-xs font-montserrat font-bold text-neutral-700 uppercase">Score</th>
					<th class="px-4 py-3 text-left text-xs font-montserrat font-bold text-neutral-700 uppercase">Away Team</th>
					<th class="px-4 py-3 text-center text-xs font-montserrat font-bold text-neutral-700 uppercase">Status</th>
					<th class="px-4 py-3 text-center text-xs font-montserrat font-bold text-neutral-700 uppercase">Action</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-neutral-100">
				{#each matches as match}
					{@const matchComplete = isMatchComplete(match)}
					{@const matchScore = getMatchScore(match)}
					<tr class="hover:bg-neutral-50/50 transition-colors {matchComplete ? 'bg-green-50/30' : ''}">
						<td class="px-4 py-4">
							<span class="font-montserrat font-bold text-sm text-indigo-600">{match.round === 'Grand Final' ? `Final ${match.category}` : match.matchStrId}</span>
						</td>
						<td class="px-4 py-4">
							<span class="text-sm font-poppins text-neutral-700">{match.time}</span>
						</td>
						<td class="px-4 py-4">
							<span class="text-xs font-poppins font-semibold px-2 py-1 rounded {match.level === 'SMA' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}">{match.category}</span>
						</td>
						<td class="px-4 py-4">
							<div class="flex items-center gap-2">
								<div class="w-1 h-8 rounded-full bg-indigo-600"></div>
								<span class="text-sm font-poppins font-semibold {(match.team1 === 'TBD' || match.team1.includes('Winner')) ? 'text-neutral-300 italic' : 'text-neutral-900'}">{match.team1}</span>
							</div>
						</td>
						<td class="px-4 py-4">
							{#if matchComplete}
								<div class="flex items-center justify-center gap-2">
									<span class="text-lg font-montserrat font-black text-indigo-600">{matchScore.score1}</span>
									<span class="text-neutral-400">-</span>
									<span class="text-lg font-montserrat font-black text-neutral-600">{matchScore.score2}</span>
								</div>
							{:else}
								<span class="text-neutral-300 text-sm font-poppins">-</span>
							{/if}
						</td>
						<td class="px-4 py-4">
							<div class="flex items-center gap-2">
								<div class="w-1 h-8 rounded-full bg-red-500"></div>
								<span class="text-sm font-poppins font-semibold {(match.team2 === 'TBD' || match.team2.includes('Winner')) ? 'text-neutral-300 italic' : 'text-neutral-900'}">{match.team2}</span>
							</div>
						</td>
						<td class="px-4 py-4 text-center">
							{#if matchComplete}
								<span class="bg-green-100 text-green-700 border border-green-200 text-[10px] px-2 py-1 rounded font-poppins font-semibold inline-flex items-center gap-1">
									<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
									Complete
								</span>
							{:else}
								<span class="text-neutral-400 text-xs font-poppins">Pending</span>
							{/if}
						</td>
						<td class="px-4 py-4 text-center">
							<button onclick={() => onOpenScoreModal(match)} class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-poppins font-medium text-xs rounded-lg transition-colors">
								{matchComplete ? 'Edit' : 'Input'}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

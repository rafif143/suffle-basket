<script>
	let { matches = [], level = 'SMA', gender = 'Putra', scores = {} } = $props();

	// Group matches by rounds from actual data
	let rounds = $derived.by(() => {
		const roundOf16 = matches.filter(m => m.round === '16 Besar');
		const quarterFinals = matches.filter(m => m.round === '8 Besar');
		const semiFinals = matches.filter(m => m.round === 'Semi Final');
		const finals = matches.filter(m => m.round === 'Final');

		return {
			roundOf16,
			quarterFinals,
			semiFinals,
			finals
		};
	});
</script>

<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-6">
	<div class="flex items-center gap-3 mb-6">
		<div class="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
			</svg>
		</div>
		<div>
			<h3 class="font-montserrat text-lg font-extrabold text-neutral-900">Tournament Bracket</h3>
			<p class="text-xs text-neutral-500">{level} {gender} - Single Elimination</p>
		</div>
	</div>

	<div class="overflow-x-auto">
		<div class="min-w-[800px] flex gap-8">
			<!-- Round of 16 -->
			<div class="flex-1">
				<h4 class="text-xs font-montserrat font-extrabold text-neutral-600 uppercase tracking-wide mb-3 text-center">Round of 16</h4>
				<div class="space-y-3">
					{#each rounds.roundOf16 as match}
						{@const score = scores[match.match_key]}
						{@const isComplete = score && score.score1 !== undefined && score.score2 !== undefined}
						<div class="bg-neutral-50 border-2 {isComplete ? 'border-green-200' : 'border-neutral-200'} rounded-lg p-3">
							<div class="text-[10px] font-poppins font-bold text-neutral-500 mb-1">{match.matchStrId}</div>
							<div class="space-y-1">
								<div class="flex items-center justify-between">
									<span class="text-sm font-poppins font-semibold text-neutral-900 truncate">{match.team1 || 'TBD'}</span>
									{#if isComplete}
										<span class="text-sm font-montserrat font-black text-indigo-600">{score.score1}</span>
									{/if}
								</div>
								<div class="flex items-center justify-between">
									<span class="text-sm font-poppins font-semibold text-neutral-900 truncate">{match.team2 || 'TBD'}</span>
									{#if isComplete}
										<span class="text-sm font-montserrat font-black text-indigo-600">{score.score2}</span>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Quarter Finals -->
			<div class="flex-1">
				<h4 class="text-xs font-montserrat font-extrabold text-neutral-600 uppercase tracking-wide mb-3 text-center">Quarter Finals</h4>
				<div class="space-y-6 pt-8">
					{#each rounds.quarterFinals as match}
						{@const score = scores[match.match_key]}
						{@const isComplete = score && score.score1 !== undefined && score.score2 !== undefined}
						<div class="bg-neutral-50 border-2 {isComplete ? 'border-green-200' : 'border-neutral-200'} rounded-lg p-3">
							<div class="text-[10px] font-poppins font-bold text-neutral-500 mb-1">{match.matchStrId}</div>
							<div class="space-y-1">
								<div class="flex items-center justify-between">
									<span class="text-sm font-poppins font-semibold text-neutral-700 truncate">{match.team1 || 'TBD'}</span>
									{#if isComplete}
										<span class="text-sm font-montserrat font-black text-indigo-600">{score.score1}</span>
									{/if}
								</div>
								<div class="flex items-center justify-between">
									<span class="text-sm font-poppins font-semibold text-neutral-700 truncate">{match.team2 || 'TBD'}</span>
									{#if isComplete}
										<span class="text-sm font-montserrat font-black text-indigo-600">{score.score2}</span>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Semi Finals -->
			<div class="flex-1">
				<h4 class="text-xs font-montserrat font-extrabold text-neutral-600 uppercase tracking-wide mb-3 text-center">Semi Finals</h4>
				<div class="space-y-12 pt-16">
					{#each rounds.semiFinals as match}
						{@const score = scores[match.match_key]}
						{@const isComplete = score && score.score1 !== undefined && score.score2 !== undefined}
						<div class="bg-neutral-50 border-2 {isComplete ? 'border-green-200' : 'border-neutral-200'} rounded-lg p-3">
							<div class="text-[10px] font-poppins font-bold text-neutral-500 mb-1">{match.matchStrId}</div>
							<div class="space-y-1">
								<div class="flex items-center justify-between">
									<span class="text-sm font-poppins font-semibold text-neutral-700 truncate">{match.team1 || 'TBD'}</span>
									{#if isComplete}
										<span class="text-sm font-montserrat font-black text-indigo-600">{score.score1}</span>
									{/if}
								</div>
								<div class="flex items-center justify-between">
									<span class="text-sm font-poppins font-semibold text-neutral-700 truncate">{match.team2 || 'TBD'}</span>
									{#if isComplete}
										<span class="text-sm font-montserrat font-black text-indigo-600">{score.score2}</span>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Finals -->
			<div class="flex-1">
				<h4 class="text-xs font-montserrat font-extrabold text-neutral-600 uppercase tracking-wide mb-3 text-center">Grand Final</h4>
				<div class="pt-24">
					{#each rounds.finals as match}
						{@const score = scores[match.match_key]}
						{@const isComplete = score && score.score1 !== undefined && score.score2 !== undefined}
						<div class="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 {isComplete ? 'border-amber-300' : 'border-amber-200'} rounded-lg p-4">
							<div class="text-[10px] font-poppins font-bold text-amber-700 mb-2 text-center">FINAL</div>
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<span class="text-sm font-poppins font-bold text-neutral-900 truncate">{match.team1 || 'TBD'}</span>
									{#if isComplete}
										<span class="text-lg font-montserrat font-black text-amber-600">{score.score1}</span>
									{/if}
								</div>
								<div class="flex items-center justify-between">
									<span class="text-sm font-poppins font-bold text-neutral-900 truncate">{match.team2 || 'TBD'}</span>
									{#if isComplete}
										<span class="text-lg font-montserrat font-black text-amber-600">{score.score2}</span>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
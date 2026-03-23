<script>
	let { 
		type = 'card', // 'card', 'table', 'list'
		count = 3,
		height = 'h-20'
	} = $props();
</script>

{#if type === 'card'}
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each Array(count) as _}
			<div class="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 bg-neutral-200 rounded-lg"></div>
					<div class="flex-1">
						<div class="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
						<div class="h-3 bg-neutral-200 rounded w-1/2"></div>
					</div>
				</div>
				<div class="space-y-2">
					<div class="h-3 bg-neutral-200 rounded"></div>
					<div class="h-3 bg-neutral-200 rounded w-5/6"></div>
				</div>
			</div>
		{/each}
	</div>
{:else if type === 'table'}
	<div class="bg-white rounded-xl border border-neutral-200 overflow-hidden animate-pulse">
		<div class="p-4 border-b border-neutral-200">
			<div class="h-6 bg-neutral-200 rounded w-1/4"></div>
		</div>
		{#each Array(count) as _}
			<div class="p-4 border-b border-neutral-100 flex items-center gap-4">
				<div class="w-10 h-10 bg-neutral-200 rounded-lg"></div>
				<div class="flex-1 space-y-2">
					<div class="h-4 bg-neutral-200 rounded w-3/4"></div>
					<div class="h-3 bg-neutral-200 rounded w-1/2"></div>
				</div>
				<div class="w-20 h-8 bg-neutral-200 rounded"></div>
			</div>
		{/each}
	</div>
{:else if type === 'list'}
	<div class="space-y-3">
		{#each Array(count) as _}
			<div class="bg-white rounded-lg border border-neutral-200 p-3 animate-pulse">
				<div class="flex items-center gap-3">
					<div class="w-6 h-6 bg-neutral-200 rounded"></div>
					<div class="flex-1">
						<div class="h-4 bg-neutral-200 rounded w-2/3 mb-1"></div>
						<div class="h-3 bg-neutral-200 rounded w-1/3"></div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<!-- Custom skeleton -->
	<div class="animate-pulse">
		{#each Array(count) as _}
			<div class="bg-neutral-200 rounded {height} mb-3"></div>
		{/each}
	</div>
{/if}
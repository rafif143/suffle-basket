<script>
	let {
		activeLevel = $bindable('SMA'),
		activeGender = $bindable('Putra')
	} = $props();
</script>

<div class="flex gap-3">
	<!-- Level Toggle -->
	<div class="flex gap-2 bg-neutral-100 p-1 rounded-lg">
		{#each ['SMA', 'SMP'] as lvl}
			<button
				class="px-6 py-2 rounded-md font-poppins font-semibold text-sm transition-all {activeLevel === lvl
					? 'bg-white text-indigo-600 shadow-sm'
					: 'text-neutral-600 hover:text-neutral-900'}"
				onclick={() => (activeLevel = lvl)}
			>
				{lvl}
			</button>
		{/each}
	</div>

	<!-- Gender Toggle -->
	<div class="flex gap-2 bg-neutral-100 p-1 rounded-lg">
		{#each ['Putra', 'Putri'] as gen}
			<button
				class="px-6 py-2 rounded-md font-poppins font-semibold text-sm transition-all {activeGender === gen
					? 'bg-white text-indigo-600 shadow-sm'
					: 'text-neutral-600 hover:text-neutral-900'}"
				onclick={() => (activeGender = gen)}
			>
				{gen}
			</button>
		{/each}
	</div>
</div>

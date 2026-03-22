<script>
	let {
		label,
		value,
		total,
		variant = 'default'
	} = $props();
	
	const colors = {
		default: 'text-neutral-900',
		pending: 'text-amber-600',
		verified: 'text-indigo-600',
		rejected: 'text-red-600'
	};
	
	const barColors = {
		default: 'bg-neutral-200',
		pending: 'bg-amber-400',
		verified: 'bg-indigo-600',
		rejected: 'bg-red-500'
	};
	
	const percentage = $derived(total ? (value / total) * 100 : 0);
</script>

<div class="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-5 relative overflow-hidden">
	<p class="text-[11px] font-poppins font-bold text-neutral-400 uppercase tracking-wide mb-1.5">{label}</p>
	<p class="font-montserrat text-4xl font-black {colors[variant]} mb-3.5 leading-none">{value}</p>
	<div class="h-0.5 rounded-full {barColors[variant]} transition-all duration-500" style="width: {percentage}%"></div>
</div>

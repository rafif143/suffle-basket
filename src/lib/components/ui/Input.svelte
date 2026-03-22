<script>
	let {
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		required = false,
		class: className = '',
		...rest
	} = $props();
</script>

<input
	{type}
	bind:value
	{placeholder}
	{disabled}
	{required}
	class="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition-all {className}"
	{...rest}
/>

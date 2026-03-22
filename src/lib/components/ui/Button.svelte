<script>
	let { 
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		onclick,
		children,
		class: className = '',
		...rest
	} = $props();
	
	const variants = {
		primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200',
		secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border border-neutral-200',
		danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
		ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-600'
	};
	
	const sizes = {
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-4 py-2.5 text-sm',
		lg: 'px-6 py-3 text-base'
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="font-poppins font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 {variants[variant]} {sizes[size]} {className}"
	{...rest}
>
	{@render children()}
</button>

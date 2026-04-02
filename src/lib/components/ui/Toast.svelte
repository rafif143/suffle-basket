<script>
    import { fly, fade } from 'svelte/transition';
    import { toast } from '$lib/stores/toast.svelte.js';

    const icons = {
        success: 'm9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
        error: 'm10 10 4 4m0-4-4 4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
        info: 'M12 8h.01M12 12h.01M12 16h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
    };

    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    };

    const iconColors = {
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-indigo-500'
    };
</script>

<div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
    {#each toast.current as item (item.id)}
        <div 
            in:fly={{ y: 20, duration: 300, easing: t => t * (2 - t) }}
            out:fade={{ duration: 200 }}
            class="pointer-events-auto min-w-[300px] max-w-md p-4 rounded-2xl border shadow-xl backdrop-blur-md flex items-center gap-3 {colors[item.type]}"
        >
            <div class="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class={iconColors[item.type]}>
                    <path d={icons[item.type] || icons.info}/>
                </svg>
            </div>
            <div class="flex-1 font-poppins text-sm font-semibold">
                {item.message}
            </div>
            <button 
                onclick={() => toast.remove(item.id)}
                class="flex-shrink-0 text-current opacity-30 hover:opacity-100 transition-opacity"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    {/each}
</div>

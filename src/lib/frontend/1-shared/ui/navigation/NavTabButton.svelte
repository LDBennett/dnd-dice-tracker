<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { href, label, active, icon }: {
		href: string;
		label: string;
		active: boolean;
		icon: Snippet;
	} = $props();
</script>

<button
	type="button"
	onclick={() => goto(resolve(href))}
	aria-label={label}
	class={['flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 transition-colors', active ? 'text-amber-400' : 'text-slate-400']}
>
	{@render icon()}
	<span class={['h-1 w-1 rounded-full transition-opacity', active ? 'bg-amber-400 opacity-100' : 'opacity-0']}></span>
</button>

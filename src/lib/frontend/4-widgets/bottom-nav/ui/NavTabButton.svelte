<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { href, label, active, icon, animClass = '' }: {
		href: string;
		label: string;
		active: boolean;
		icon: Snippet;
		animClass?: string;
	} = $props();

	let isAnimating = $state(false);

	function handleClick() {
		if (animClass) {
			isAnimating = true;
			setTimeout(() => { isAnimating = false; }, 500);
		}
		goto(resolve(href));
	}
</script>

<button
	type="button"
	onclick={handleClick}
	aria-label={label}
	class={['flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 transition-colors', active ? 'text-accent' : 'text-stone-400']}
>
	<span class={[isAnimating && animClass]}>
		{@render icon()}
	</span>
	<span class={['text-xs font-semibold transition-colors', active ? 'text-accent' : 'text-stone-500']}>{label}</span>
</button>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'neutral',
		children,
		class: extraClass
	}: {
		variant?: 'success' | 'danger' | 'warning' | 'neutral';
		children?: Snippet;
		class?: string;
	} = $props();

	const variantCls = $derived(
		{
			success: 'bg-green-900/40 text-green-400',
			danger: 'bg-red-900/40 text-red-400',
			warning: 'bg-amber-400/20 text-amber-400',
			neutral: 'bg-slate-700 text-slate-400'
		}[variant]
	);
</script>

<span class={['rounded-full px-2.5 py-0.5 text-xs font-semibold', variantCls, extraClass]}>
	{@render children?.()}
</span>

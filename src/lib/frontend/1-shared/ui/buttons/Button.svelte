<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'ghost',
		fullWidth = false,
		children,
		class: extraClass,
		...restProps
	}: {
		variant?: 'primary' | 'ghost';
		fullWidth?: boolean;
		children?: Snippet;
		class?: string;
		[key: string]: unknown;
	} = $props();

	const cls = $derived(
		[
			variant === 'primary'
				? 'rounded-2xl bg-accent py-4 text-base font-black text-stone-900 shadow-lg transition hover:brightness-110 active:scale-95 disabled:opacity-50'
				: 'rounded-lg px-3 py-2 text-sm text-stone-400 transition hover:bg-stone-800 hover:text-white disabled:opacity-50',
			fullWidth ? 'w-full' : '',
			extraClass ?? ''
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<button type="button" class={cls} {...restProps}>
	{@render children?.()}
</button>

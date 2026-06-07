<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		value = '',
		subtext = '',
		accent = 'default',
		valueColor = '',
		onclick = undefined,
		children = undefined
	}: {
		label: string;
		value?: string | number;
		subtext?: string;
		accent?: 'amber' | 'red' | 'default';
		valueColor?: string;
		onclick?: () => void;
		children?: Snippet;
	} = $props();

	const cardClass  = $derived(accent === 'amber' ? 'bg-accent-tint ring-accent-sm'
	                 : accent === 'red'   ? 'bg-red-900/20 ring-1 ring-red-800/40'
	                 :                      'bg-stone-800');
	const labelClass = $derived(accent === 'amber' ? 'text-accent'
	                 : accent === 'red'   ? 'text-red-500'
	                 :                      'text-stone-500');
	const valueClass = $derived(valueColor         ? ''
	                 : accent === 'amber' ? 'text-accent'
	                 : accent === 'red'   ? 'text-red-400'
	                 :                      'text-white');
</script>

{#if onclick}
	<button
		type="button"
		class={['flex w-full flex-col rounded-2xl p-5 text-left cursor-pointer transition hover:brightness-110 active:scale-95', cardClass]}
		{onclick}
	>
		<span class={['mb-1 text-xs font-semibold tracking-widest uppercase', labelClass]}>{label}</span>
		{#if children}
			{@render children()}
		{:else}
			<span class={['text-4xl font-extrabold', valueClass]} style={valueColor ? `color: ${valueColor}` : ''}>{value}</span>
		{/if}
		{#if subtext}<span class="mt-1 text-xs text-stone-500">{subtext}</span>{/if}
	</button>
{:else}
	<div class={['flex flex-col rounded-2xl p-5', cardClass]}>
		<span class={['mb-1 text-xs font-semibold tracking-widest uppercase', labelClass]}>{label}</span>
		{#if children}
			{@render children()}
		{:else}
			<span class={['text-4xl font-extrabold', valueClass]} style={valueColor ? `color: ${valueColor}` : ''}>{value}</span>
		{/if}
		{#if subtext}<span class="mt-1 text-xs text-stone-500">{subtext}</span>{/if}
	</div>
{/if}

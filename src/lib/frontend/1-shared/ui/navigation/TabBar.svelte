<script lang="ts">
	let {
		items,
		value,
		onchange,
		activeClass = 'bg-accent text-stone-900',
		bg = 'bg-stone-700',
		class: extraClass
	}: {
		items: { value: string; label: string; icon?: string }[];
		value: string;
		onchange?: (v: string) => void;
		activeClass?: string;
		bg?: string;
		class?: string;
	} = $props();

	const activeIndex = $derived(items.findIndex((i) => i.value === value));
	const activeBgClasses = $derived(activeClass.split(' ').filter((c) => c.startsWith('bg-')));
	const activeTextClasses = $derived(activeClass.split(' ').filter((c) => !c.startsWith('bg-')));
</script>

<div class={['relative flex rounded-xl p-1', bg, extraClass]}>
	<div
		aria-hidden="true"
		class={['absolute top-1 bottom-1 left-1 rounded-lg transition-transform duration-200 ease-out', ...activeBgClasses]}
		style="width: calc((100% - 0.5rem) / {items.length}); transform: translateX(calc({activeIndex} * 100%))"
	></div>

	{#each items as item (item.value)}
		<button
			type="button"
			onclick={() => onchange?.(item.value)}
			class={[
				'relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors duration-200',
				value === item.value ? activeTextClasses : ['text-stone-400 hover:text-white']
			]}
		>
			{#if item.icon}
				<span class={['mdi', item.icon, 'text-base']}></span>
			{/if}
			{item.label}
		</button>
	{/each}
</div>

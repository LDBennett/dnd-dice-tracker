<script lang="ts">
	let {
		items,
		value,
		onchange,
		activeClass = 'bg-orange-400 text-stone-900',
		bg = 'bg-stone-700',
		class: extraClass
	}: {
		items: { value: string; label: string }[];
		value: string;
		onchange?: (v: string) => void;
		activeClass?: string;
		bg?: string;
		class?: string;
	} = $props();
</script>

<div class={['flex rounded-xl p-1', bg, extraClass]}>
	{#each items as item (item.value)}
		<button
			type="button"
			onclick={() => onchange?.(item.value)}
			class={[
				'flex-1 rounded-lg py-2 text-sm font-semibold transition',
				value === item.value ? activeClass : 'text-stone-400 hover:text-white'
			]}>{item.label}</button
		>
	{/each}
</div>

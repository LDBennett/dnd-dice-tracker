<script lang="ts">
	import type { Theme } from '@fe-shared/ui';

	let {
		theme,
		active,
		onselect
	}: {
		theme: Theme;
		active: boolean;
		onselect: () => void;
	} = $props();
</script>

<button
	type="button"
	onclick={onselect}
	class={[
		'relative flex w-full flex-col gap-2 rounded-2xl p-3 text-left transition hover:brightness-110 active:scale-95',
		active ? 'bg-stone-600' : 'bg-stone-700'
	]}
	style={active ? `outline: 2px solid ${theme.accent}; outline-offset: 2px` : ''}
>
	{#if active}
		<span class="mdi mdi-check absolute top-2 right-2 text-sm" style="color: {theme.accent}"></span>
	{/if}

	<div class="flex items-center gap-1.5">
		<span class={['mdi text-base', theme.icon]} style="color: {theme.accent}"></span>
		<span class="text-xs font-bold text-white">{theme.label}</span>
	</div>

	<div class="flex gap-1">
		{#each theme.palette as color, i (i)}
			<span
				class={[i === 0 ? 'flex-1' : 'w-4 shrink-0', 'h-2.5 rounded-full']}
				style="background-color: {color}"
			></span>
		{/each}
	</div>
</button>

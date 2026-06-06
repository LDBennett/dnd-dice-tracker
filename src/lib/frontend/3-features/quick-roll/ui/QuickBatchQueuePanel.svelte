<script lang="ts">
	import { DIE_COLOR } from '@fe-shared/ui';
	import type { DieType } from '@fe-shared/lib';

	let {
		queue,
		onRollAll,
		onClear
	}: {
		queue: DieType[];
		onRollAll: () => void;
		onClear: () => void;
	} = $props();
</script>

<div class="rounded-2xl border border-stone-700 bg-stone-800 p-4">
	<p class="mb-3 text-xs font-semibold tracking-widest text-stone-500 uppercase">Roll Queue</p>
	<div class="mb-4 flex flex-wrap gap-2">
		{#each [...new Set(queue)] as die (die)}
			{@const count = queue.filter((d) => d === die).length}
			<span
				class="rounded-full px-3 py-1 text-sm font-bold text-stone-900"
				style="background: {DIE_COLOR[die]}"
			>{count > 1 ? `${count}×` : ''}d{die}</span>
		{/each}
	</div>
	<div class="flex gap-2">
		<button
			type="button"
			onclick={onRollAll}
			class="flex-1 rounded-2xl py-3 text-base font-black text-stone-900 transition hover:brightness-110 active:scale-95"
			style="background: #fbbf24"
		>Roll All! ({queue.length})</button>
		<button
			type="button"
			onclick={onClear}
			class="rounded-2xl px-4 py-3 text-sm font-semibold text-stone-400 transition hover:bg-stone-700 hover:text-white"
		>Clear</button>
	</div>
</div>

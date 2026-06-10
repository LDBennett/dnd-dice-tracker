<script lang="ts">
	import { DieChip } from '@fe-entities/die';
	import { DIE_COLOR, IconButton } from '@fe-shared/ui';

	let {
		dieType,
		value,
		note = $bindable(''),
		index,
		editMode,
		isGuest,
		onedit,
		onblur: onblurCallback,
		ondelete
	}: {
		dieType: number;
		value: number;
		note: string;
		index: number;
		editMode: boolean;
		isGuest: boolean;
		onedit: () => void;
		onblur: () => void;
		ondelete: () => void;
	} = $props();

	const bgColor = $derived(DIE_COLOR[dieType] ?? '#94a3b8');
</script>

{#if isGuest || !editMode}
	<div class="flex flex-col items-center gap-1.5 rounded-2xl py-1">
		<span
			class="flex w-full flex-col items-center gap-1 rounded-3xl px-2 py-2.5 font-bold text-stone-900"
			style="background: {bgColor}"
		>
			<DieChip {dieType} {value} />
		</span>
		{#if note}
			<p class="w-full truncate text-center text-xs leading-4 text-stone-400">{note}</p>
		{/if}
	</div>
{:else}
	<div class="flex items-center gap-2">
		<button
			type="button"
			onclick={onedit}
			title="Edit roll value"
			class="flex w-16 shrink-0 flex-col items-center gap-1 rounded-3xl px-2 py-2.5 font-bold text-stone-900 ring-offset-stone-800 transition hover:scale-105 hover:ring-2 hover:brightness-125 active:scale-95"
			style="background: {bgColor}; --tw-ring-color: {bgColor}60;"
		>
			<DieChip {dieType} {value} />
		</button>
		<input
			id={'note-' + index}
			type="text"
			bind:value={note}
			onblur={onblurCallback}
			placeholder="Notes (optional)"
			class="accent-focus flex-1 rounded-lg border border-stone-600 bg-stone-700/60 px-2.5 py-1.5 text-xs text-white placeholder-stone-500"
		/>
		<IconButton
			icon="mdi-trash-can-outline"
			size="sm"
			hoverColor="red"
			rounded="lg"
			onclick={ondelete}
			aria-label="Delete roll"
		/>
	</div>
{/if}

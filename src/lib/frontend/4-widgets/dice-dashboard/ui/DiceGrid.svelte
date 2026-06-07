<script lang="ts">
	import { getAppContext } from '@fe-shared/context';
	import { RollEntryCard } from '@fe-features/log-roll';
	import type { DieType, RollResult } from '@fe-shared/lib';
	import type { BatchEntry } from '@fe-features/log-roll';
	import { DIE_COLOR, DIE_SHAPE, DIE_TEXT_Y } from '@fe-shared/ui';

	const DICE: DieType[] = [4, 6, 8, 10, 12, 20, 100];

	let {
		batchMode,
		pressing,
		selectedDie,
		quickBatchQueue,
		batchEntries,
		sessionRolls,
		onDieClick,
		onConfirm,
		onCancel
	}: {
		batchMode: boolean;
		pressing: DieType | null;
		selectedDie: DieType | null;
		quickBatchQueue: DieType[];
		batchEntries: BatchEntry[];
		sessionRolls: RollResult[];
		onDieClick: (die: DieType) => void;
		onConfirm: (roll: RollResult) => void;
		onCancel: () => void;
	} = $props();

	const app = getAppContext();
</script>

<div class="relative">
	<div
		class="grid grid-cols-3 gap-3 transition-all duration-300 sm:grid-cols-4"
		class:opacity-20={selectedDie !== null}
		class:pointer-events-none={selectedDie !== null}
	>
		{#each DICE as die (die)}
			<button
				type="button"
				onclick={() => onDieClick(die)}
				style="transition: transform 120ms cubic-bezier(.34,1.56,.64,1); transform: {pressing === die ? 'scale(0.82)' : 'scale(1)'};"
				class="relative flex aspect-square items-center justify-center"
			>
				<svg viewBox="0 0 100 100" class="h-full w-full">
					{#if DIE_SHAPE[die]}
						<polygon
							points={DIE_SHAPE[die]!}
							fill="{DIE_COLOR[die]}33"
							stroke={DIE_COLOR[die]}
							stroke-width="5"
							stroke-linejoin="round"
						/>
					{:else}
						<circle
							cx="50"
							cy="50"
							r="44"
							fill="{DIE_COLOR[die]}33"
							stroke={DIE_COLOR[die]}
							stroke-width="5"
						/>
					{/if}
					<text
						x="50"
						y={DIE_TEXT_Y[die]}
						text-anchor="middle"
						dominant-baseline="middle"
						fill={DIE_COLOR[die]}
						font-size={die === 100 ? 14 : 18}
						font-weight="800"
						font-family="system-ui, sans-serif"
					>d{die}</text>
				</svg>
				{#if batchMode}
					{@const count = app.rollMode
						? quickBatchQueue.filter((d) => d === die).length
						: batchEntries.filter((e) => e.dieType === die).length}
					{#if count > 0}
						<span
							class="absolute top-1.5 right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-black text-stone-900"
							>×{count}</span
						>
					{/if}
				{/if}
			</button>
		{/each}
	</div>

	{#if selectedDie !== null}
		<RollEntryCard
			die={selectedDie}
			{sessionRolls}
			{onConfirm}
			{onCancel}
		/>
	{/if}
</div>

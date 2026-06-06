<script lang="ts">
	import { getAppContext } from '@fe-shared/context';
	import { RollEntryCard } from '@fe-features/log-roll';
	import type { RollResult } from '@fe-entities/session';
	import { DIE_COLOR } from '@fe-shared/ui';

	type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;
	interface BatchEntry {
		id: number;
		dieType: DieType;
		value: number;
	}

	const DICE: DieType[] = [4, 6, 8, 10, 12, 20, 100];

	// SVG polygon points for each die silhouette (100×100 viewBox, inset ~6px for stroke)
	const DIE_SHAPE: Record<DieType, string | null> = {
		4:   '50,6 94,90 6,90',               // triangle up
		6:   '6,6 94,6 94,94 6,94',            // square
		8:   '50,6 94,50 50,94 6,50',          // diamond
		10:  '50,6 92,40 75,94 25,94 8,40',    // kite
		12:  '50,6 92,36 76,86 24,86 8,36',    // pentagon
		20:  '50,6 88,28 88,72 50,94 12,72 12,28', // hexagon
		100: null                              // circle — rendered separately
	};

	// Y coordinate of each shape's visual centroid, for centering the label text
	const DIE_TEXT_Y: Record<DieType, number> = {
		4: 62, 6: 50, 8: 50, 10: 55, 12: 50, 20: 50, 100: 50
	};

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
							class="absolute top-1.5 right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-400 px-1 text-xs font-black text-stone-900"
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

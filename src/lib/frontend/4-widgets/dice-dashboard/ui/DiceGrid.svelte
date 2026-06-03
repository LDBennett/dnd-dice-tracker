<script lang="ts">
	import { getAppContext } from '@fe-shared/context';
	import { RollEntryCard } from '@fe-features/log-roll';
	import type { RollResult } from '@fe-entities/session';
	import { DiceD100Icon, DIE_COLOR } from '@fe-shared/ui';

	type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;
	interface BatchEntry {
		id: number;
		dieType: DieType;
		value: number;
	}

	const DICE: DieType[] = [4, 6, 8, 10, 12, 20, 100];

	const DIE_ICON: Record<DieType, string | null> = {
		4: 'mdi-dice-d4',
		6: 'mdi-dice-d6',
		8: 'mdi-dice-d8',
		10: 'mdi-dice-d10',
		12: 'mdi-dice-d12',
		20: 'mdi-dice-d20',
		100: null
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
				style="transition: transform 120ms cubic-bezier(.34,1.56,.64,1); transform: {pressing === die ? 'scale(0.82)' : 'scale(1)'}; border-color: {DIE_COLOR[die]}b3; color: {DIE_COLOR[die]};"
				class="relative flex min-h-22 flex-col items-center justify-center rounded-2xl border-2 bg-stone-800 font-bold shadow-lg hover:bg-stone-700"
			>
				{#if DIE_ICON[die]}
					<span class="mdi {DIE_ICON[die]} text-5xl"></span>
				{:else}
					<DiceD100Icon class="text-5xl" />
				{/if}
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

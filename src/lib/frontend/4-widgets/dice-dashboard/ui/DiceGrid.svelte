<script lang="ts">
	import { getAppContext } from '@fe-shared/context';
	import { DiceExpandedCard } from '@fe-features/log-roll';
	import type { RollResult } from '@fe-entities/roll-session';
	import { DiceD100Icon } from '@fe-shared/ui';

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

	const DIE_BORDER: Record<DieType, string> = {
		4: 'border-red-500/70 text-red-400',
		6: 'border-orange-500/70 text-orange-400',
		8: 'border-yellow-500/70 text-yellow-400',
		10: 'border-green-500/70 text-green-400',
		12: 'border-teal-500/70 text-teal-400',
		20: 'border-amber-400/70 text-amber-400',
		100: 'border-purple-500/70 text-purple-400'
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
				style="transition: transform 120ms cubic-bezier(.34,1.56,.64,1); transform: {pressing ===
				die
					? 'scale(0.82)'
					: 'scale(1)'};"
				class="relative flex min-h-22 flex-col items-center justify-center rounded-2xl border-2 bg-slate-800 font-bold shadow-lg hover:bg-slate-700 {DIE_BORDER[
					die
				]}"
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
							class="absolute top-1.5 right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-black text-slate-900"
							>×{count}</span
						>
					{/if}
				{/if}
			</button>
		{/each}
	</div>

	{#if selectedDie !== null}
		<DiceExpandedCard
			die={selectedDie}
			{sessionRolls}
			{onConfirm}
			{onCancel}
		/>
	{/if}
</div>

<script lang="ts">
	import { DIE_COLOR } from '$lib/frontend/shared/ui/dice-colors';
	import { DiceExpandedCard } from '$lib/frontend/features/log-roll';
	import { BatchPanel } from '$lib/frontend/features/batch-roll';
	import { PendingRollsQueue, submitRollSession } from '$lib/frontend/features/submit-session';
	import type { RollResult } from '$lib/frontend/features/submit-session';

	type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;
	interface BatchEntry { id: number; dieType: DieType; value: number; }

	const DICE: DieType[] = [4, 6, 8, 10, 12, 20, 100];

	let {
		rightHanded = false,
		isGuest = false,
		onSignInClick = () => {}
	}: { rightHanded?: boolean; isGuest?: boolean; onSignInClick?: () => void } = $props();

	// Single-die state
	let selectedDie = $state<DieType | null>(null);
	let pressing    = $state<DieType | null>(null);

	// Batch state
	let batchMode    = $state(false);
	let batchEntries = $state<BatchEntry[]>([]);

	// Session state
	let pendingRolls = $state<RollResult[]>([]);
	let sessionName  = $state('');
	let submitting   = $state(false);
	let lastResult   = $state<{ rolls: RollResult[]; total: number } | null>(null);
	let saveError    = $state<string | null>(null);

	const sessionRolls = $derived(
		selectedDie !== null ? pendingRolls.filter((r) => r.dieType === selectedDie) : []
	);

	const DIE_BORDER: Record<DieType, string> = {
		4: 'border-red-500/70 text-red-400',
		6: 'border-orange-500/70 text-orange-400',
		8: 'border-yellow-500/70 text-yellow-400',
		10: 'border-green-500/70 text-green-400',
		12: 'border-teal-500/70 text-teal-400',
		20: 'border-amber-400/70 text-amber-400',
		100: 'border-purple-500/70 text-purple-400'
	};

	function setMode(batch: boolean) {
		batchMode = batch;
		if (batch) { selectedDie = null; }
		else { batchEntries = []; }
	}

	function selectDie(die: DieType) {
		pressing = die;
		setTimeout(() => {
			pressing    = null;
			selectedDie = die;
		}, 120);
	}

	function addBatchDie(die: DieType) {
		batchEntries = [...batchEntries, { id: Date.now(), dieType: die, value: Math.ceil(die / 2) }];
	}

	function addToSession(roll: RollResult) {
		pendingRolls = [...pendingRolls, roll];
		selectedDie  = null;
	}

	function addBatchToSession(rolls: RollResult[]) {
		pendingRolls = [...pendingRolls, ...rolls];
	}

	async function submitSession() {
		if (pendingRolls.length === 0 || submitting) return;
		if (isGuest) { onSignInClick(); return; }
		submitting = true;
		saveError  = null;
		try {
			const result = await submitRollSession(pendingRolls, sessionName);
			lastResult   = result;
			pendingRolls = [];
			sessionName  = '';
		} catch (e) {
			saveError = e instanceof Error ? e.message : 'Network error';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex flex-col gap-6 px-4 py-6">

	<!-- Mode toggle -->
	<div class="flex rounded-xl bg-slate-800 p-1">
		<button
			type="button"
			onclick={() => setMode(false)}
			class="flex-1 rounded-lg py-2 text-sm font-semibold transition {!batchMode
				? 'bg-amber-400 text-slate-900'
				: 'text-slate-400 hover:text-white'}"
		>Single</button>
		<button
			type="button"
			onclick={() => setMode(true)}
			class="flex-1 rounded-lg py-2 text-sm font-semibold transition {batchMode
				? 'bg-amber-400 text-slate-900'
				: 'text-slate-400 hover:text-white'}"
		>Batch</button>
	</div>

	<!-- Grid + expanded card -->
	<div class="relative">
		<div
			class="grid grid-cols-3 gap-3 transition-all duration-300 sm:grid-cols-4"
			class:opacity-20={selectedDie !== null}
			class:pointer-events-none={selectedDie !== null}
		>
			{#each DICE as die (die)}
				<button
					type="button"
					onclick={() => (batchMode ? addBatchDie(die) : selectDie(die))}
					style="transition: transform 120ms cubic-bezier(.34,1.56,.64,1); transform: {pressing === die ? 'scale(0.82)' : 'scale(1)'};"
					class="relative flex min-h-22 flex-col items-center justify-center rounded-2xl border-2 bg-slate-800 font-bold shadow-lg hover:bg-slate-700 {DIE_BORDER[die]}"
				>
					<span class="text-3xl font-extrabold">d{die}</span>
					{#if batchMode && batchEntries.filter((e) => e.dieType === die).length > 0}
						<span
							class="absolute top-1.5 right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-black text-slate-900"
						>×{batchEntries.filter((e) => e.dieType === die).length}</span>
					{/if}
				</button>
			{/each}
		</div>

		{#if selectedDie !== null}
			<DiceExpandedCard
				die={selectedDie}
				{rightHanded}
				{isGuest}
				{sessionRolls}
				onConfirm={addToSession}
				onCancel={() => (selectedDie = null)}
			/>
		{/if}
	</div>

	<!-- Batch panel -->
	{#if batchMode && batchEntries.length > 0}
		<BatchPanel bind:entries={batchEntries} onConfirm={addBatchToSession} />
	{/if}

	<!-- Pending queue -->
	{#if pendingRolls.length > 0}
		<PendingRollsQueue
			rolls={pendingRolls}
			{isGuest}
			{submitting}
			{saveError}
			bind:sessionName
			onSubmit={submitSession}
			onClear={() => (pendingRolls = [])}
		/>
	{/if}

	<!-- Last result -->
	{#if lastResult}
		<div class="rounded-2xl border border-slate-700 bg-slate-800/50 p-4">
			<p class="mb-2 text-xs font-semibold tracking-widest text-slate-500 uppercase">Last Session</p>
			<div class="flex flex-col gap-2">
				{#each lastResult.rolls as roll, i (i)}
					<div class="flex items-start gap-2">
						<span
							class="mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold text-slate-900"
							style="background: {DIE_COLOR[roll.dieType]}"
						>d{roll.dieType}→{roll.value}</span>
						{#if roll.note}
							<span class="text-xs leading-5 text-slate-400">{roll.note}</span>
						{/if}
					</div>
				{/each}
			</div>
			<p class="mt-3 text-right text-lg font-bold text-white">
				Total Rolls: <span class="text-amber-400">{lastResult.rolls.length}</span>
			</p>
		</div>
	{/if}
</div>

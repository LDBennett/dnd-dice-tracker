<script lang="ts">
	import { DIE_COLOR } from '$lib/frontend/shared/ui/dice-colors';
	import { DiceExpandedCard } from '$lib/frontend/features/log-roll';
	import { QuickRollOverlay, QuickBatchRollOverlay } from '$lib/frontend/features/quick-roll';
	import { BatchPanel } from '$lib/frontend/features/batch-roll';
	import { PendingRollsQueue, submitRollSession } from '$lib/frontend/features/submit-session';
	import type { RollResult } from '$lib/frontend/features/submit-session';

	type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;
	interface BatchEntry { id: number; dieType: DieType; value: number; }

	const DICE: DieType[] = [4, 6, 8, 10, 12, 20, 100];

	let {
		rightHanded = false,
		isGuest = false,
		rollMode = false,
		onSignInClick = () => {}
	}: { rightHanded?: boolean; isGuest?: boolean; rollMode?: boolean; onSignInClick?: () => void } = $props();

	// Single-die state
	let selectedDie  = $state<DieType | null>(null);
	let pressing     = $state<DieType | null>(null);
	let quickRollDie = $state<DieType | null>(null);

	// Batch state
	let batchMode    = $state(false);
	let batchEntries = $state<BatchEntry[]>([]);

	// Quick-batch state (Quick+Batch mode: queue dice, then roll all simultaneously)
	let quickBatchQueue   = $state<DieType[]>([]);
	let quickBatchRolling = $state(false);

	// Clear quick-batch state whenever the mode that uses it becomes inactive
	$effect(() => {
		if (!rollMode || !batchMode) {
			quickBatchQueue   = [];
			quickBatchRolling = false;
		}
	});

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
			pressing = null;
			if (rollMode) { quickRollDie = die; }
			else           { selectedDie  = die; }
		}, 120);
	}

	function onQuickRollDone(value: number) {
		if (quickRollDie === null) return;
		pendingRolls = [...pendingRolls, { dieType: quickRollDie, value, note: '' }];
		quickRollDie = null;
	}

	function addBatchDie(die: DieType) {
		if (batchEntries.length >= 20) return;
		batchEntries = [...batchEntries, { id: Date.now(), dieType: die, value: Math.ceil(die / 2) }];
	}

	function addToQuickBatch(die: DieType) {
		if (quickBatchQueue.length >= 20) return;
		quickBatchQueue = [...quickBatchQueue, die];
	}

	function startQuickBatchRoll() {
		if (quickBatchQueue.length === 0) return;
		quickBatchRolling = true;
	}

	function onQuickBatchAllDone(results: { dieType: DieType; value: number }[]) {
		pendingRolls    = [...pendingRolls, ...results.map((r) => ({ ...r, note: '' }))];
		quickBatchQueue   = [];
		quickBatchRolling = false;
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

	<!-- Quick roll overlay — single mode -->
	{#if quickRollDie !== null}
		<QuickRollOverlay die={quickRollDie} onComplete={onQuickRollDone} />
	{/if}

	<!-- Simultaneous roll overlay — batch+quick mode -->
	{#if quickBatchRolling}
		<QuickBatchRollOverlay dice={quickBatchQueue} onComplete={onQuickBatchAllDone} />
	{/if}

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
					onclick={() => batchMode ? (rollMode ? addToQuickBatch(die) : addBatchDie(die)) : selectDie(die)}
					style="transition: transform 120ms cubic-bezier(.34,1.56,.64,1); transform: {pressing === die ? 'scale(0.82)' : 'scale(1)'};"
					class="relative flex min-h-22 flex-col items-center justify-center rounded-2xl border-2 bg-slate-800 font-bold shadow-lg hover:bg-slate-700 {DIE_BORDER[die]}"
				>
					<span class="text-3xl font-extrabold">d{die}</span>
					{#if batchMode}
						{@const count = rollMode
							? quickBatchQueue.filter((d) => d === die).length
							: batchEntries.filter((e) => e.dieType === die).length}
						{#if count > 0}
							<span
								class="absolute top-1.5 right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-black text-slate-900"
							>×{count}</span>
						{/if}
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

	<!-- Quick batch queue panel -->
	{#if batchMode && rollMode && quickBatchQueue.length > 0 && !quickBatchRolling}
		<div class="rounded-2xl border border-slate-700 bg-slate-800 p-4">
			<p class="mb-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">Roll Queue</p>
			<div class="mb-4 flex flex-wrap gap-2">
				{#each [...new Set(quickBatchQueue)] as die (die)}
					{@const count = quickBatchQueue.filter((d) => d === die).length}
					<span
						class="rounded-full px-3 py-1 text-sm font-bold text-slate-900"
						style="background: {DIE_COLOR[die]}"
					>{count > 1 ? `${count}×` : ''}d{die}</span>
				{/each}
			</div>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={startQuickBatchRoll}
					class="flex-1 rounded-2xl py-3 text-base font-black text-slate-900 transition hover:brightness-110 active:scale-95"
					style="background: #fbbf24"
				>Roll All! ({quickBatchQueue.length})</button>
				<button
					type="button"
					onclick={() => { quickBatchQueue = []; }}
					class="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-slate-700 hover:text-white"
				>Clear</button>
			</div>
		</div>
	{/if}

	<!-- Batch panel -->
	{#if batchMode && !rollMode && batchEntries.length > 0}
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

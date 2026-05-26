<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { backOut, cubicOut } from 'svelte/easing';

	type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

	interface RollResult {
		dieType: DieType;
		value: number;
		note: string;
	}

	interface HistoryEntry {
		value: number;
		note: string;
		date: string;
	}

	interface BatchEntry {
		id: number;
		dieType: DieType;
		value: number;
	}

	const DICE: DieType[] = [4, 6, 8, 10, 12, 20, 100];

	let {
		rightHanded = false,
		isGuest = false,
		onSignInClick = () => {}
	}: { rightHanded?: boolean; isGuest?: boolean; onSignInClick?: () => void } = $props();

	// Single-die mode state
	let selectedDie    = $state<DieType | null>(null);
	let sliderValue    = $state(1);
	let rollNote       = $state('');
	let pressing       = $state<DieType | null>(null);
	let dieTab         = $state<'roll' | 'history'>('roll');
	let historyRolls   = $state<HistoryEntry[]>([]);
	let historyLoading = $state(false);

	// Batch mode state
	let batchMode    = $state(false);
	let batchEntries = $state<BatchEntry[]>([]);
	let batchNote    = $state('');
	let quickFill    = $state('');

	// Session state (shared)
	let pendingRolls = $state<RollResult[]>([]);
	let sessionName  = $state('');
	let submitting   = $state(false);
	let lastResult   = $state<{ rolls: RollResult[]; total: number } | null>(null);
	let saveError    = $state<string | null>(null);

	// Derived
	const sessionRolls = $derived(
		selectedDie !== null ? pendingRolls.filter((r) => r.dieType === selectedDie) : []
	);
	const batchCounts = $derived(
		batchEntries.reduce(
			(acc, e) => { acc[e.dieType] = (acc[e.dieType] ?? 0) + 1; return acc; },
			{} as Partial<Record<DieType, number>>
		)
	);
	const batchTotal = $derived(batchEntries.reduce((s, e) => s + e.value, 0));
	const quickFillValidation = $derived(
		quickFill.trim()
			? quickFill
					.split(/[\s,]+/)
					.map((n) => parseInt(n, 10))
					.filter((n) => !isNaN(n))
					.map((value, i) => {
						const entry = batchEntries[i];
						return entry
							? { value, dieType: entry.dieType as DieType | null, valid: value >= 1 && value <= entry.dieType }
							: { value, dieType: null as DieType | null, valid: false };
					})
			: ([] as Array<{ value: number; dieType: DieType | null; valid: boolean }>)
	);
	const quickFillReady = $derived(
		quickFillValidation.length === batchEntries.length &&
		batchEntries.length > 0 &&
		quickFillValidation.every((item) => item.valid)
	);

	// Mode toggle
	function setMode(batch: boolean) {
		batchMode = batch;
		if (batch) {
			selectedDie = null;
			rollNote    = '';
		} else {
			batchEntries = [];
			batchNote    = '';
		}
	}

	// Single-die functions
	function selectDie(die: DieType) {
		pressing = die;
		setTimeout(() => {
			pressing    = null;
			selectedDie = die;
			sliderValue = Math.ceil(die / 2);
			rollNote    = '';
			dieTab      = 'roll';
			historyRolls = [];
		}, 120);
	}

	function cancelSlider() {
		selectedDie = null;
		rollNote    = '';
	}

	function confirmRoll() {
		if (selectedDie === null) return;
		pendingRolls = [
			...pendingRolls,
			{ dieType: selectedDie, value: sliderValue, note: rollNote.trim() }
		];
		selectedDie = null;
		rollNote    = '';
	}

	async function loadHistory(dieType: DieType) {
		historyLoading = true;
		historyRolls   = [];
		try {
			const res = await fetch('/api/rolls');
			if (res.ok) {
				const sessions = (await res.json()) as Array<{
					rolls: Array<{ dieType: number; value: number; note: string }>;
					rolledAt: string;
				}>;
				historyRolls = sessions.flatMap((s) =>
					s.rolls
						.filter((r) => r.dieType === dieType)
						.map((r) => ({ value: r.value, note: r.note, date: s.rolledAt }))
				);
			}
		} finally {
			historyLoading = false;
		}
	}

	function switchToHistory() {
		dieTab = 'history';
		if (selectedDie !== null) loadHistory(selectedDie);
	}

	// Batch functions
	function addBatchDie(die: DieType) {
		batchEntries = [...batchEntries, { id: Date.now(), dieType: die, value: Math.ceil(die / 2) }];
	}

	function removeBatchEntry(id: number) {
		batchEntries = batchEntries.filter((e) => e.id !== id);
	}

	function setBatchValue(id: number, value: number) {
		batchEntries = batchEntries.map((e) =>
			e.id === id ? { ...e, value: Math.max(1, Math.min(e.dieType, value)) } : e
		);
	}

	function stepBatchValue(id: number, delta: number) {
		batchEntries = batchEntries.map((e) => {
			if (e.id !== id) return e;
			return { ...e, value: Math.max(1, Math.min(e.dieType, e.value + delta)) };
		});
	}

	function applyQuickFill() {
		const nums = quickFill
			.split(/[\s,]+/)
			.map((n) => parseInt(n, 10))
			.filter((n) => !isNaN(n) && n > 0);
		if (nums.length === 0) return;
		batchEntries = batchEntries.map((e, i) =>
			i < nums.length ? { ...e, value: Math.max(1, Math.min(e.dieType, nums[i])) } : e
		);
		quickFill = '';
	}

	function confirmBatch() {
		if (batchEntries.length === 0) return;
		for (const entry of batchEntries) {
			pendingRolls = [
				...pendingRolls,
				{ dieType: entry.dieType, value: entry.value, note: batchNote.trim() }
			];
		}
		batchEntries = [];
		batchNote    = '';
	}

	// Session functions
	async function submitSession() {
		if (pendingRolls.length === 0 || submitting) return;
		if (isGuest) { onSignInClick(); return; }
		submitting = true;
		saveError  = null;
		try {
			const res = await fetch('/api/roll', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ dice: pendingRolls, name: sessionName })
			});
			if (res.ok) {
				const data = await res.json();
				lastResult   = { rolls: data.rolls, total: data.total };
				pendingRolls = [];
				sessionName  = '';
			} else {
				const text = await res.text().catch(() => res.statusText);
				saveError = `Save failed (${res.status}): ${text}`;
			}
		} catch (e) {
			saveError = e instanceof Error ? e.message : 'Network error';
		} finally {
			submitting = false;
		}
	}

	function clearPending() { pendingRolls = []; }

	function fmtDate(iso: string) {
		const d = new Date(iso);
		return (
			d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
			' ' +
			d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
		);
	}

	const DIE_BORDER: Record<DieType, string> = {
		4: 'border-red-500/70 text-red-400',
		6: 'border-orange-500/70 text-orange-400',
		8: 'border-yellow-500/70 text-yellow-400',
		10: 'border-green-500/70 text-green-400',
		12: 'border-teal-500/70 text-teal-400',
		20: 'border-amber-400/70 text-amber-400',
		100: 'border-purple-500/70 text-purple-400'
	};

	const DIE_COLOR: Record<DieType, string> = {
		4: '#f87171', 6: '#fb923c', 8: '#facc15',
		10: '#4ade80', 12: '#2dd4bf', 20: '#fbbf24', 100: '#c084fc'
	};
</script>

<div class="flex flex-col gap-6 px-4 py-6">

	<!-- Mode toggle -->
	<div class="flex bg-slate-800 p-1 rounded-xl">
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

	<!-- Grid + expanded card container -->
	<div class="relative">
		<!-- Backdrop (single mode only) -->
		{#if selectedDie !== null}
			<button
				type="button"
				class="z-10 fixed inset-0 cursor-default"
				onclick={cancelSlider}
				aria-label="Dismiss"
				in:fade={{ duration: 150 }}
				out:fade={{ duration: 120 }}
			></button>
		{/if}

		<!-- Dice grid -->
		<div
			class="gap-3 grid grid-cols-3 sm:grid-cols-4 transition-all duration-300"
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
					<span class="font-extrabold text-3xl">d{die}</span>
					{#if batchMode && (batchCounts[die] ?? 0) > 0}
						<span
							class="top-1.5 right-1.5 absolute flex justify-center items-center bg-amber-400 px-1 rounded-full min-w-5 h-5 font-black text-slate-900 text-xs"
						>×{batchCounts[die]}</span>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Expanded die card (single mode only) -->
		{#if selectedDie !== null}
			<div
				in:scale={{ start: 0.55, duration: 340, easing: backOut }}
				out:scale={{ start: 0.65, duration: 180, easing: cubicOut }}
				class="absolute inset-x-0 top-0 z-20 rounded-3xl border-2 bg-slate-800 p-5 shadow-2xl {DIE_BORDER[selectedDie]}"
			>
				<!-- Header -->
				<div class="flex justify-between items-center mb-3">
					<p class="font-black text-4xl" style="color: {DIE_COLOR[selectedDie]}">d{selectedDie}</p>
					<button
						type="button"
						onclick={cancelSlider}
						class="flex justify-center items-center hover:bg-slate-700 rounded-xl w-9 h-9 text-slate-400 hover:text-white active:scale-90 transition"
						aria-label="Close">✕</button
					>
				</div>

				<!-- Tab bar -->
				{#if !isGuest}
					<div class="flex gap-1 bg-slate-700 mb-4 p-1 rounded-xl">
						<button
							type="button"
							onclick={() => (dieTab = 'roll')}
							class="flex-1 rounded-lg py-2 text-sm font-semibold transition {dieTab === 'roll'
								? 'bg-slate-900 text-white'
								: 'text-slate-400 hover:text-white'}">Roll</button
						>
						<button
							type="button"
							onclick={switchToHistory}
							class="flex-1 rounded-lg py-2 text-sm font-semibold transition {dieTab === 'history'
								? 'bg-slate-900 text-white'
								: 'text-slate-400 hover:text-white'}">History</button
						>
					</div>
				{/if}

				{#if dieTab === 'roll' || isGuest}
					<!-- Slider + value -->
					<div class="flex items-stretch gap-4" class:flex-row-reverse={rightHanded}>
						<div
							class="flex flex-col justify-between py-1 font-semibold text-slate-500 text-sm"
							class:items-end={!rightHanded}
							class:items-start={rightHanded}
						>
							<span>{selectedDie}</span>
							<span>1</span>
						</div>
						<div class="flex flex-1 justify-center items-center">
							<input
								type="range"
								min="1"
								max={selectedDie}
								bind:value={sliderValue}
								style="writing-mode: vertical-lr; direction: rtl; height: 200px; width: 44px; cursor: pointer; accent-color: {DIE_COLOR[selectedDie]};"
								aria-label="Roll value"
							/>
						</div>
						<div class="flex flex-col justify-center items-center gap-1 w-20">
							<span class="font-black text-white text-6xl leading-none">{sliderValue}</span>
							{#if selectedDie === 20}
								{#if sliderValue === 20}
									<span in:fade={{ duration: 120 }} class="bg-amber-400/20 px-2 py-0.5 rounded-full font-bold text-amber-400 text-xs">NAT 20!</span>
								{:else if sliderValue === 1}
									<span in:fade={{ duration: 120 }} class="bg-red-900/40 px-2 py-0.5 rounded-full font-bold text-red-400 text-xs">NAT 1</span>
								{/if}
							{/if}
						</div>
					</div>

					<input
						type="text"
						bind:value={rollNote}
						placeholder="Note for this roll (optional)"
						class="bg-slate-700 mt-4 px-3 py-2.5 border border-slate-600 focus:border-amber-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400/30 w-full text-white text-sm placeholder-slate-500"
					/>

					<button
						type="button"
						onclick={confirmRoll}
						class="shadow-lg hover:brightness-110 mt-3 py-4 rounded-2xl w-full font-black text-slate-900 text-base active:scale-95 transition"
						style="background: {DIE_COLOR[selectedDie]};">Log Roll</button
					>

				{:else}
					<!-- History tab -->
					<div class="flex flex-col gap-4 pr-1 max-h-72 overflow-y-auto">
						{#if sessionRolls.length > 0}
							<div>
								<p class="mb-1.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">This session</p>
								<div class="flex flex-col gap-1.5">
									{#each sessionRolls as r, i (i)}
										<div class="flex items-center gap-3">
											<span class="w-8 font-black text-white text-xl text-right">{r.value}</span>
											{#if r.note}<span class="text-slate-400 text-xs">{r.note}</span>{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}
						<div>
							<p class="mb-1.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Overall</p>
							{#if historyLoading}
								<p class="text-slate-500 text-xs">Loading…</p>
							{:else if historyRolls.length === 0}
								<p class="text-slate-500 text-xs">No past rolls for d{selectedDie}.</p>
							{:else}
								<div class="flex flex-col gap-1.5">
									{#each historyRolls as h, i (i)}
										<div class="flex justify-between items-center gap-2">
											<div class="flex items-center gap-3">
												<span class="w-8 font-black text-white text-xl text-right">{h.value}</span>
												{#if h.note}<span class="text-slate-400 text-xs">{h.note}</span>{/if}
											</div>
											<span class="text-slate-600 text-xs shrink-0">{fmtDate(h.date)}</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Batch entry panel -->
	{#if batchMode && batchEntries.length > 0}
		<div class="bg-slate-800 p-4 rounded-2xl">
			<h3 class="mb-3 font-semibold text-slate-300 text-sm">Batch rolls</h3>

			<div class="flex flex-col gap-3 mb-3">
				{#each batchEntries as entry (entry.id)}
					<div class="bg-slate-700/50 p-3 rounded-xl">
						<!-- Slider -->
						<input
							type="range"
							min="1"
							max={entry.dieType}
							value={entry.value}
							oninput={(e) => setBatchValue(entry.id, parseInt(e.currentTarget.value))}
							style="accent-color: {DIE_COLOR[entry.dieType]}; width: 100%;"
							class="block mb-2"
							aria-label="Roll value for d{entry.dieType}"
						/>

						<!-- Die chip + stepper + remove -->
						<div class="flex items-center gap-3">
							<span
								class="px-2.5 py-1 rounded-full font-black text-slate-900 text-xs shrink-0"
								style="background: {DIE_COLOR[entry.dieType]}"
							>d{entry.dieType}</span>

							<div class="flex flex-1 justify-center items-center gap-3 bg-slate-700 px-2 py-1 rounded-xl">
								<button
									type="button"
									onclick={() => stepBatchValue(entry.id, -1)}
									class="flex justify-center items-center hover:bg-slate-600 rounded-lg w-9 h-9 text-slate-300 text-xl active:scale-90 transition"
									aria-label="Decrease">−</button
								>
								<span class="min-w-[3ch] font-black text-white text-xl text-center">{entry.value}</span>
								<button
									type="button"
									onclick={() => stepBatchValue(entry.id, 1)}
									class="flex justify-center items-center hover:bg-slate-600 rounded-lg w-9 h-9 text-slate-300 text-xl active:scale-90 transition"
									aria-label="Increase">+</button
								>
							</div>

							<button
								type="button"
								onclick={() => removeBatchEntry(entry.id)}
								class="flex justify-center items-center hover:bg-slate-700 rounded-xl w-9 h-9 text-slate-500 hover:text-white transition shrink-0"
								aria-label="Remove">✕</button
							>
						</div>
					</div>
				{/each}
			</div>

			<!-- Quick fill -->
			<div class="mb-4">
				<div class="flex gap-2">
					<input
						type="text"
						bind:value={quickFill}
						placeholder="Quick fill: 14, 6, 3"
						class="flex-1 bg-slate-700/60 px-3 py-2.5 border border-slate-600 focus:border-amber-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400/30 min-w-0 text-white text-sm placeholder-slate-500"
					/>
					<button
						type="button"
						onclick={applyQuickFill}
						disabled={!quickFillReady}
						class="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 px-4 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white text-sm transition shrink-0"
					>Apply</button>
				</div>

				{#if quickFillValidation.length > 0}
					<div class="flex flex-wrap gap-1.5 mt-2">
						{#each quickFillValidation as item, i (i)}
							{#if item.dieType !== null}
								<span class="rounded-full px-2.5 py-0.5 text-xs font-semibold {item.valid ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}">
									d{item.dieType}: {item.value} {item.valid ? '✓' : `✗ (max ${item.dieType})`}
								</span>
							{:else}
								<span class="bg-slate-700 px-2.5 py-0.5 rounded-full font-semibold text-slate-500 text-xs">
									{item.value} — no die
								</span>
							{/if}
						{/each}
						{#if batchEntries.length > quickFillValidation.length}
							<span class="bg-slate-700/60 px-2.5 py-0.5 rounded-full text-slate-500 text-xs">
								+{batchEntries.length - quickFillValidation.length} unfilled
							</span>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Batch total -->
			<p class="mb-3 text-slate-400 text-sm">
				Total: <span class="font-black text-amber-400">{batchTotal}</span>
			</p>

			<!-- Shared note -->
			<input
				type="text"
				bind:value={batchNote}
				placeholder="Note for all rolls (optional)"
				class="bg-slate-700 mb-3 px-3 py-2.5 border border-slate-600 focus:border-amber-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400/30 w-full text-white text-sm placeholder-slate-500"
			/>

			<button
				type="button"
				onclick={confirmBatch}
				class="bg-amber-400 shadow-lg hover:brightness-110 py-4 rounded-2xl w-full font-black text-slate-900 text-base active:scale-95 transition"
			>Add {batchEntries.length} {batchEntries.length === 1 ? 'roll' : 'rolls'} to session</button>
		</div>
	{/if}

	<!-- Pending rolls queue -->
	{#if pendingRolls.length > 0}
		<div class="bg-slate-800 p-4 rounded-2xl">
			<div class="flex justify-between items-center mb-3">
				<h3 class="font-semibold text-slate-300 text-sm">This session</h3>
				<button type="button" onclick={clearPending} class="text-slate-500 hover:text-slate-300 text-xs">Clear</button>
			</div>

			<div class="flex flex-col gap-2 mb-4">
				{#each pendingRolls as roll, i (i)}
					<div class="flex items-start gap-2">
						<span
							class="mt-0.5 px-2.5 py-0.5 rounded-full font-bold text-slate-900 text-xs shrink-0"
							style="background: {DIE_COLOR[roll.dieType]}"
						>d{roll.dieType}→{roll.value}</span>
						{#if roll.note}
							<span class="text-slate-400 text-xs leading-5">{roll.note}</span>
						{/if}
					</div>
				{/each}
			</div>

			<input
				type="text"
				bind:value={sessionName}
				placeholder="Session name (optional)"
				class="bg-slate-700 mb-3 px-3 py-2.5 border border-slate-600 focus:border-amber-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400/30 w-full font-semibold text-white text-sm placeholder-slate-500"
			/>

			{#if saveError}
				<p class="bg-red-900/40 mb-2 px-3 py-2 rounded-lg text-red-400 text-xs">{saveError}</p>
			{/if}

			<div class="flex justify-between items-center">
				<span class="text-slate-400 text-sm">
					<span class="font-bold text-white">{pendingRolls.length}</span>
					{pendingRolls.length === 1 ? 'roll' : 'rolls'}
				</span>
				{#if !isGuest}
					<button
					type="button"
					onclick={submitSession}
					disabled={submitting}
					class="rounded-xl px-6 py-3 text-sm font-bold transition active:scale-95 disabled:opacity-50 {isGuest
						? 'border border-amber-400 text-amber-400 hover:bg-amber-400/10'
						: 'bg-amber-400 text-slate-900 hover:bg-amber-300'}"
				>{submitting ? 'Saving…' : isGuest ? 'Sign in to save' : 'Save Session'}</button>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Last result -->
	{#if lastResult}
		<div class="bg-slate-800/50 p-4 border border-slate-700 rounded-2xl">
			<p class="mb-2 font-semibold text-slate-500 text-xs uppercase tracking-widest">Last Session</p>
			<div class="flex flex-col gap-2">
				{#each lastResult.rolls as roll, i (i)}
					<div class="flex items-start gap-2">
						<span
							class="mt-0.5 px-2.5 py-0.5 rounded-full font-bold text-slate-900 text-xs shrink-0"
							style="background: {DIE_COLOR[roll.dieType]}"
						>d{roll.dieType}→{roll.value}</span>
						{#if roll.note}
							<span class="text-slate-400 text-xs leading-5">{roll.note}</span>
						{/if}
					</div>
				{/each}
			</div>
			<p class="mt-3 font-bold text-white text-lg text-right">
				Total Rolls: <span class="text-amber-400">{lastResult.rolls.length}</span>
			</p>
		</div>
	{/if}
</div>

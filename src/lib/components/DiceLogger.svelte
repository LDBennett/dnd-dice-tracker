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

	const DICE: DieType[] = [4, 6, 8, 10, 12, 20, 100];

	let selectedDie = $state<DieType | null>(null);
	let sliderValue = $state(1);
	let rollNote = $state('');
	let pressing = $state<DieType | null>(null);
	let pendingRolls = $state<RollResult[]>([]);
	let sessionName = $state('');
	let submitting = $state(false);
	let lastResult = $state<{ rolls: RollResult[]; total: number } | null>(null);
	let saveError = $state<string | null>(null);
	let dieTab = $state<'roll' | 'history'>('roll');
	let historyRolls = $state<HistoryEntry[]>([]);
	let historyLoading = $state(false);

	const sessionRolls = $derived(
		selectedDie !== null ? pendingRolls.filter((r) => r.dieType === selectedDie) : []
	);

	function selectDie(die: DieType) {
		pressing = die;
		setTimeout(() => {
			pressing = null;
			selectedDie = die;
			sliderValue = Math.ceil(die / 2);
			rollNote = '';
			dieTab = 'roll';
			historyRolls = [];
		}, 120);
	}

	function cancelSlider() {
		selectedDie = null;
		rollNote = '';
	}

	function confirmRoll() {
		if (selectedDie === null) return;
		pendingRolls = [
			...pendingRolls,
			{ dieType: selectedDie, value: sliderValue, note: rollNote.trim() }
		];
		selectedDie = null;
		rollNote = '';
	}

	async function loadHistory(dieType: DieType) {
		historyLoading = true;
		historyRolls = [];
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

	async function submitSession() {
		if (pendingRolls.length === 0 || submitting) return;
		submitting = true;
		saveError = null;
		try {
			const res = await fetch('/api/roll', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ dice: pendingRolls, name: sessionName })
			});
			if (res.ok) {
				const data = await res.json();
				lastResult = { rolls: data.rolls, total: data.total };
				pendingRolls = [];
				sessionName = '';
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

	function clearPending() {
		pendingRolls = [];
	}

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
		4: '#f87171',
		6: '#fb923c',
		8: '#facc15',
		10: '#4ade80',
		12: '#2dd4bf',
		20: '#fbbf24',
		100: '#c084fc'
	};
</script>

<div class="flex flex-col gap-6 px-4 py-6">
	<!-- Grid + expanded card container -->
	<div class="relative">
		<!-- Backdrop -->
		{#if selectedDie !== null}
			<button
				type="button"
				class="fixed inset-0 z-10 cursor-default"
				onclick={cancelSlider}
				aria-label="Dismiss"
				in:fade={{ duration: 150 }}
				out:fade={{ duration: 120 }}
			></button>
		{/if}

		<!-- Dice grid -->
		<div
			class="grid grid-cols-3 gap-3 transition-all duration-300 sm:grid-cols-4"
			class:opacity-20={selectedDie !== null}
			class:pointer-events-none={selectedDie !== null}
		>
			{#each DICE as die (die)}
				<button
					type="button"
					onclick={() => selectDie(die)}
					style="transition: transform 120ms cubic-bezier(.34,1.56,.64,1); transform: {pressing ===
					die
						? 'scale(0.82)'
						: 'scale(1)'};"
					class="flex min-h-22 flex-col items-center justify-center rounded-2xl border-2 bg-slate-800 font-bold shadow-lg hover:bg-slate-700 {DIE_BORDER[
						die
					]}"
				>
					<span class="text-3xl font-extrabold">d{die}</span>
				</button>
			{/each}
		</div>

		<!-- Expanded die card -->
		{#if selectedDie !== null}
			<div
				in:scale={{ start: 0.55, duration: 340, easing: backOut }}
				out:scale={{ start: 0.65, duration: 180, easing: cubicOut }}
				class="absolute inset-x-0 top-0 z-20 rounded-3xl border-2 bg-slate-800 p-5 shadow-2xl {DIE_BORDER[
					selectedDie
				]}"
			>
				<!-- Header -->
				<div class="mb-3 flex items-center justify-between">
					<p class="text-4xl font-black" style="color: {DIE_COLOR[selectedDie]}">d{selectedDie}</p>
					<button
						type="button"
						onclick={cancelSlider}
						class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-700 hover:text-white active:scale-90"
						aria-label="Close">✕</button
					>
				</div>

				<!-- Tab bar -->
				<div class="mb-4 flex gap-1 rounded-xl bg-slate-700 p-1">
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

				{#if dieTab === 'roll'}
					<!-- Slider + value -->
					<div class="flex items-stretch gap-4">
						<div
							class="flex flex-col items-end justify-between py-1 text-sm font-semibold text-slate-500"
						>
							<span>{selectedDie}</span>
							<span>1</span>
						</div>
						<div class="flex flex-1 items-center justify-center">
							<input
								type="range"
								min="1"
								max={selectedDie}
								bind:value={sliderValue}
								style="writing-mode: vertical-lr; direction: rtl; height: 200px; width: 44px; cursor: pointer; accent-color: {DIE_COLOR[
									selectedDie
								]};"
								aria-label="Roll value"
							/>
						</div>
						<div class="flex w-20 flex-col items-center justify-center gap-1">
							<span class="text-6xl leading-none font-black text-white">{sliderValue}</span>
							{#if selectedDie === 20}
								{#if sliderValue === 20}
									<span
										in:fade={{ duration: 120 }}
										class="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-400"
										>NAT 20!</span
									>
								{:else if sliderValue === 1}
									<span
										in:fade={{ duration: 120 }}
										class="rounded-full bg-red-900/40 px-2 py-0.5 text-xs font-bold text-red-400"
										>NAT 1</span
									>
								{/if}
							{/if}
						</div>
					</div>

					<!-- Note input -->
					<input
						type="text"
						bind:value={rollNote}
						placeholder="Note for this roll (optional)"
						class="mt-4 w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 focus:outline-none"
					/>

					<!-- Log Roll -->
					<button
						type="button"
						onclick={confirmRoll}
						class="mt-3 w-full rounded-2xl py-4 text-base font-black text-slate-900 shadow-lg transition hover:brightness-110 active:scale-95"
						style="background: {DIE_COLOR[selectedDie]};">Log Roll</button
					>
				{:else}
					<!-- History tab -->
					<div class="flex max-h-72 flex-col gap-4 overflow-y-auto pr-1">
						<!-- This session -->
						{#if sessionRolls.length > 0}
							<div>
								<p class="mb-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
									This session
								</p>
								<div class="flex flex-col gap-1.5">
									{#each sessionRolls as r, i (i)}
										<div class="flex items-center gap-3">
											<span class="w-8 text-right text-xl font-black text-white">{r.value}</span>
											{#if r.note}
												<span class="text-xs text-slate-400">{r.note}</span>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Overall -->
						<div>
							<p class="mb-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
								Overall
							</p>
							{#if historyLoading}
								<p class="text-xs text-slate-500">Loading…</p>
							{:else if historyRolls.length === 0}
								<p class="text-xs text-slate-500">No past rolls for d{selectedDie}.</p>
							{:else}
								<div class="flex flex-col gap-1.5">
									{#each historyRolls as h, i (i)}
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-3">
												<span class="w-8 text-right text-xl font-black text-white">{h.value}</span>
												{#if h.note}
													<span class="text-xs text-slate-400">{h.note}</span>
												{/if}
											</div>
											<span class="shrink-0 text-xs text-slate-600">{fmtDate(h.date)}</span>
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

	<!-- Pending rolls queue -->
	{#if pendingRolls.length > 0}
		<div class="rounded-2xl bg-slate-800 p-4">
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-semibold text-slate-300">This session</h3>
				<button
					type="button"
					onclick={clearPending}
					class="text-xs text-slate-500 hover:text-slate-300">Clear</button
				>
			</div>

			<div class="mb-4 flex flex-col gap-2">
				{#each pendingRolls as roll, i (i)}
					<div class="flex items-start gap-2">
						<span
							class="mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold text-slate-900"
							style="background: {DIE_COLOR[roll.dieType]}">d{roll.dieType}→{roll.value}</span
						>
						{#if roll.note}
							<span class="text-xs leading-5 text-slate-400">{roll.note}</span>
						{/if}
					</div>
				{/each}
			</div>

			<input
				type="text"
				bind:value={sessionName}
				placeholder="Session name (optional)"
				class="mb-3 w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 focus:outline-none"
			/>

			{#if saveError}
				<p class="mb-2 rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-400">{saveError}</p>
			{/if}

			<div class="flex items-center justify-between">
				<span class="text-sm text-slate-400">
					<span class="font-bold text-white">{pendingRolls.length}</span>
					{pendingRolls.length === 1 ? 'roll' : 'rolls'}
				</span>
				<button
					type="button"
					onclick={submitSession}
					disabled={submitting}
					class="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-300 active:scale-95 disabled:opacity-50"
				>
					{submitting ? 'Saving…' : 'Save Session'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Last result -->
	{#if lastResult}
		<div class="rounded-2xl border border-slate-700 bg-slate-800/50 p-4">
			<p class="mb-2 text-xs font-semibold tracking-widest text-slate-500 uppercase">
				Last Session
			</p>
			<div class="flex flex-col gap-2">
				{#each lastResult.rolls as roll, i (i)}
					<div class="flex items-start gap-2">
						<span
							class="mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold text-slate-900"
							style="background: {DIE_COLOR[roll.dieType]}">d{roll.dieType}→{roll.value}</span
						>
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

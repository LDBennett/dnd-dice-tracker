<script lang="ts">
	import { getAppContext } from '@fe-shared/context';
	import { TabBar, IconButton } from '@fe-shared/ui';
	import { fmtDate, fmtTime } from '@fe-shared/lib';
	import {
		QuickRollOverlay,
		QuickBatchRollOverlay,
		QuickBatchQueuePanel
	} from '@fe-features/quick-roll';
	import { BatchEntryPanel } from '@fe-features/log-roll';
	import { ActiveSessionPanel } from '@fe-features/active-session';
	import type { RollResult } from '@fe-entities/session';
	import DiceGrid from './DiceGrid.svelte';

	type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;
	interface BatchEntry {
		id: number;
		dieType: DieType;
		value: number;
	}

	const app = getAppContext();
	const session = app.session;

	// Die selection state
	let selectedDie = $state<DieType | null>(null);
	let pressing = $state<DieType | null>(null);
	let quickRollDie = $state<DieType | null>(null);

	// Batch state
	let batchMode = $state(false);
	let batchEntries = $state<BatchEntry[]>([]);

	// Session title editing
	let editingTitle = $state(false);
	let titleDraft = $state('');

	function startEditTitle() {
		titleDraft = session.currentSessionName;
		editingTitle = true;
	}

	async function commitTitle() {
		editingTitle = false;
		await session.patch({ name: titleDraft.trim() });
	}

	function onTitleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') (e.target as HTMLElement).blur();
		if (e.key === 'Escape') {
			editingTitle = false;
		}
	}

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	// Quick-batch state
	let quickBatchQueue = $state<DieType[]>([]);
	let quickBatchRolling = $state(false);

	$effect(() => {
		if (!app.rollMode || !batchMode) {
			quickBatchQueue = [];
			quickBatchRolling = false;
		}
	});

	const sessionRolls = $derived(
		selectedDie !== null ? session.currentSessionRolls.filter((r) => r.dieType === selectedDie) : []
	);

	const modeTabs = [
		{ value: 'rp', label: 'Single', icon: 'mdi-hexagon' },
		{ value: 'battle', label: 'Multi', icon: 'mdi-hexagon-multiple-outline' }
	];

	function setMode(batch: boolean) {
		batchMode = batch;
		if (batch) selectedDie = null;
		else batchEntries = [];
	}

	function handleDieClick(die: DieType) {
		pressing = die;
		setTimeout(() => {
			pressing = null;
			if (batchMode) {
				if (app.rollMode) addToQuickBatch(die);
				else addBatchDie(die);
			} else {
				if (app.rollMode) quickRollDie = die;
				else selectedDie = die;
			}
		}, 120);
	}

	function addBatchDie(die: DieType) {
		if (batchEntries.length >= 20) return;
		batchEntries = [...batchEntries, { id: Date.now(), dieType: die, value: Math.ceil(die / 2) }];
	}

	function addToQuickBatch(die: DieType) {
		if (quickBatchQueue.length >= 20) return;
		quickBatchQueue = [...quickBatchQueue, die];
	}

	function onQuickRollDone(value: number) {
		if (quickRollDie === null) return;
		const die = quickRollDie;
		quickRollDie = null;
		session.autoSave([{ dieType: die, value, note: '' }]);
	}

	function onQuickBatchAllDone(results: { dieType: DieType; value: number }[]) {
		quickBatchQueue = [];
		quickBatchRolling = false;
		session.autoSave(results.map((r) => ({ ...r, note: '' })));
	}

	function addToSession(roll: RollResult) {
		selectedDie = null;
		session.autoSave([roll]);
	}

	function addBatchToSession(rolls: RollResult[]) {
		session.autoSave(rolls);
	}
</script>

<div class="flex flex-col gap-6 px-4 py-6">
	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-3 rounded-2xl bg-stone-800/60 px-4 py-2.5">
			<div class="flex min-w-0 flex-1 flex-col gap-0.5">
				<div class="flex items-center gap-1.5">
					{#if editingTitle}
						<input
							type="text"
							bind:value={titleDraft}
							onblur={commitTitle}
							onkeydown={onTitleKeydown}
							placeholder="Unnamed session"
							use:focusOnMount
							class="min-w-0 flex-1 rounded-md bg-stone-700 px-2 py-0.5 text-sm font-semibold text-white placeholder-stone-500 focus:ring-1 focus:ring-orange-400/60 focus:outline-none"
						/>
					{:else if session.currentSessionId !== null}
						<span class="truncate text-sm font-semibold text-white"
							>{session.currentSessionName || 'Unnamed session'}</span
						>
						<IconButton icon="mdi-pencil-outline" size="sm" onclick={startEditTitle} />
					{:else}
						<span class="text-sm font-semibold text-stone-500">No session</span>
					{/if}
				</div>
				{#if session.rolledAt !== null}
					<p class="text-xs text-stone-500">
						{fmtDate(session.rolledAt)} · {fmtTime(session.rolledAt)}
					</p>
				{/if}
			</div>
			<div class="flex shrink-0 flex-col items-end gap-1">
				<button
					type="button"
					onclick={() => session.reset()}
					class="text-sm font-medium text-orange-400 transition hover:text-orange-300">+ New</button
				>
			</div>
		</div>
		<TabBar
			items={modeTabs}
			value={batchMode ? 'battle' : 'rp'}
			onchange={(v) => setMode(v === 'battle')}
			bg="bg-stone-800"
		/>
	</div>

	<!-- Quick roll overlays -->
	{#if quickRollDie !== null}
		<QuickRollOverlay die={quickRollDie} onComplete={onQuickRollDone} />
	{/if}
	{#if quickBatchRolling}
		<QuickBatchRollOverlay dice={quickBatchQueue} onComplete={onQuickBatchAllDone} />
	{/if}

	<!-- Dice grid -->
	<DiceGrid
		{batchMode}
		{pressing}
		{selectedDie}
		{quickBatchQueue}
		{batchEntries}
		{sessionRolls}
		onDieClick={handleDieClick}
		onConfirm={addToSession}
		onCancel={() => (selectedDie = null)}
	/>

	<!-- Quick batch queue (Battle+Quick mode) -->
	{#if batchMode && app.rollMode && quickBatchQueue.length > 0 && !quickBatchRolling}
		<QuickBatchQueuePanel
			queue={quickBatchQueue}
			onRollAll={() => {
				quickBatchRolling = true;
			}}
			onClear={() => {
				quickBatchQueue = [];
			}}
		/>
	{/if}

	<!-- Battle+Log batch panel -->
	{#if batchMode && !app.rollMode && batchEntries.length > 0}
		<BatchEntryPanel bind:entries={batchEntries} onConfirm={addBatchToSession} />
	{/if}

	<!-- Save error (saving indicator is in ActiveSessionPanel) -->
	{#if session.saveError}
		<p class="rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-400">{session.saveError}</p>
	{/if}

	<!-- Active session -->
	<ActiveSessionPanel />
</div>

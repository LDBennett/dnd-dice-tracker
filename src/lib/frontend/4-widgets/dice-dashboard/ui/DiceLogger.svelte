<script lang="ts">
	import { getAppContext } from '@fe-shared/context';
	import { TabBar, IconButton, DropdownMenu, TextInput } from '@fe-shared/ui';
	import type { DropdownItem } from '@fe-shared/ui';
	import { fmtDate, fmtTime } from '@fe-shared/lib';
	import {
		QuickRollOverlay,
		QuickBatchRollOverlay,
		QuickBatchQueuePanel
	} from '@fe-features/quick-roll';
	import { BatchEntryPanel } from '@fe-features/log-roll';
	import { ActiveSessionPanel } from '@fe-features/active-session';
	import { fetchSessions } from '@fe-entities/session';
	import type { DieType, RollResult, SessionRecord } from '@fe-shared/lib';
	import type { BatchEntry } from '@fe-features/log-roll';
	import DiceGrid from './DiceGrid.svelte';

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

	// Session picker
	let pickerOpen = $state(false);
	let pickerSessions = $state<SessionRecord[]>([]);
	let pickerLoading = $state(false);

	const sessionMenuItems: DropdownItem[] = [
		{
			label: 'New',
			icon: 'mdi-plus-circle-outline',
			onclick: () => {
				session.reset();
				pickerOpen = false;
			}
		},
		{ label: 'Continue', icon: 'mdi-play-circle-outline', onclick: openPicker }
	];

	const pickerItems = $derived(
		pickerSessions.filter((s) => s.id !== session.currentSessionId).slice(0, 8)
	);

	async function openPicker() {
		pickerOpen = true;
		pickerLoading = true;
		pickerSessions = await fetchSessions();
		pickerLoading = false;
	}

	function continueSession(record: SessionRecord) {
		session.load(record);
		selectedDie = null;
		batchEntries = [];
		pickerOpen = false;
	}
</script>

<div class="flex flex-col gap-6 px-4 py-6">
	<div class="flex flex-col gap-2">
		{#if !app.isGuest}
			<div class="flex items-center gap-3 rounded-2xl bg-stone-800/60 px-4 py-2.5">
				<div class="flex min-w-0 flex-1 flex-col gap-0.5">
					<div class="flex items-center gap-1.5">
						{#if editingTitle}
							<TextInput
								id="session-name"
								bind:value={titleDraft}
								onblur={commitTitle}
								onkeydown={onTitleKeydown}
								placeholder="Unnamed session"
								autofocus
								class="font-semibold"
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
				<DropdownMenu items={sessionMenuItems} direction="down" align="right">
					{#snippet trigger(toggle)}
						<IconButton icon="mdi-dots-vertical" size="sm" onclick={toggle} />
					{/snippet}
				</DropdownMenu>
			</div>

			{#if pickerOpen}
				<div class="flex flex-col overflow-hidden rounded-2xl bg-stone-800/60">
					{#if pickerLoading}
						<p class="px-4 py-3 text-xs text-stone-500">Loading…</p>
					{:else if pickerItems.length === 0}
						<p class="px-4 py-3 text-xs text-stone-500">No other sessions</p>
					{:else}
						{#each pickerItems as s (s.id)}
							<button
								type="button"
								onclick={() => continueSession(s)}
								class="flex items-center gap-3 px-4 py-2.5 text-left transition hover:bg-stone-700/60 active:bg-stone-700"
							>
								<span class="min-w-0 flex-1 truncate text-sm text-white"
									>{s.name || 'Unnamed session'}</span
								>
								<span class="shrink-0 text-xs text-stone-500">{fmtDate(s.rolledAt)}</span>
							</button>
						{/each}
					{/if}
				</div>
			{/if}
		{/if}
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

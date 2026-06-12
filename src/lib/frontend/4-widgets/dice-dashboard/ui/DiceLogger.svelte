<script lang="ts">
	import { ActiveSessionPanel } from '@fe-features/active-session';
	import { BatchEntryPanel } from '@fe-features/log-roll';
	import {
		QuickBatchQueuePanel,
		QuickBatchRollOverlay,
		QuickRollOverlay
	} from '@fe-features/quick-roll';
	import { getAppContext } from '@fe-shared/context';
	import type { SessionRecord } from '@fe-shared/lib';
	import { fmtDate, fmtTime } from '@fe-shared/lib';
	import type { DropdownItem } from '@fe-shared/ui';
	import { DropdownMenu, IconButton, TextInput } from '@fe-shared/ui';

	import { DiceLoggerState } from '../state/diceLogger.svelte';
	import DiceGrid from './DiceGrid.svelte';

	const app = getAppContext();
	const s = new DiceLoggerState(app);

	let swipeEl = $state<HTMLDivElement | null>(null);
	let swipeStartX = 0;
	let swipeStartY = 0;
	let isSwiping = $state(false);

	function onSwipeStart(e: PointerEvent) {
		swipeStartX = e.clientX;
		swipeStartY = e.clientY;
		isSwiping = false;
	}

	function onSwipeMove(e: PointerEvent) {
		if (isSwiping || !swipeEl) return;
		const dx = e.clientX - swipeStartX;
		const dy = e.clientY - swipeStartY;
		if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
			isSwiping = true;
			swipeEl.setPointerCapture(e.pointerId);
		}
	}

	function onSwipeEnd(e: PointerEvent) {
		if (!isSwiping) return;
		const dx = e.clientX - swipeStartX;
		if (Math.abs(dx) > 40) s.setMode(!s.batchMode);
		isSwiping = false;
	}
</script>

<div class="flex flex-col gap-6 px-4 py-6">
	<div class="flex flex-col gap-2">
		{#if !app.isGuest}
			<div class="flex items-center gap-3 rounded-2xl bg-stone-800/60 px-4 py-2.5">
				<div class="flex min-w-0 flex-1 flex-col gap-0.5">
					<div class="flex items-center gap-1.5">
						{#if s.editingTitle}
							<TextInput
								id="session-name"
								bind:value={s.titleDraft}
								onblur={s.commitTitle}
								onkeydown={(e: KeyboardEvent) => s.onTitleKeydown(e)}
								placeholder="Unnamed session"
								autofocus
								class="font-semibold"
							/>
						{:else if app.session.currentSessionId !== null}
							<span class="truncate text-sm font-semibold text-white"
								>{app.session.currentSessionName || 'Unnamed session'}</span
							>
							<IconButton icon="mdi-pencil-outline" size="sm" onclick={() => s.startEditTitle()} />
						{:else}
							<span class="text-sm font-semibold text-stone-500">No session</span>
						{/if}
					</div>
					{#if app.session.rolledAt !== null}
						<p class="text-xs text-stone-500">
							{fmtDate(app.session.rolledAt)} · {fmtTime(app.session.rolledAt)}
						</p>
					{/if}
				</div>
				<DropdownMenu items={s.sessionMenuItems as DropdownItem[]} direction="down" align="right">
					{#snippet trigger(toggle)}
						<IconButton icon="mdi-dots-vertical" size="sm" onclick={toggle} />
					{/snippet}
				</DropdownMenu>
			</div>

			{#if s.pickerOpen}
				<div class="flex flex-col overflow-hidden rounded-2xl bg-stone-800/60">
					{#if s.pickerLoading}
						<p class="px-4 py-3 text-xs text-stone-500">Loading…</p>
					{:else if s.pickerItems.length === 0}
						<p class="px-4 py-3 text-xs text-stone-500">No other sessions</p>
					{:else}
						{#each s.pickerItems as session (session.id)}
							<button
								type="button"
								onclick={() => s.continueSession(session as SessionRecord)}
								class="flex items-center gap-3 px-4 py-2.5 text-left transition hover:bg-stone-700/60 active:bg-stone-700"
							>
								<span class="min-w-0 flex-1 truncate text-sm text-white"
									>{session.name || 'Unnamed session'}</span
								>
								<span class="shrink-0 text-xs text-stone-500">{fmtDate(session.rolledAt)}</span>
							</button>
						{/each}
					{/if}
				</div>
			{/if}
		{/if}
	</div>

	<!-- Mode indicator row -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span
				class={['mdi text-sm text-accent', s.batchMode ? 'mdi-hexagon-multiple-outline' : 'mdi-hexagon']}
				aria-hidden="true"
			></span>
			<span class="text-sm font-semibold text-accent">
				{s.batchMode ? 'Multi Roll' : 'Single Roll'}
			</span>
		</div>
		<div class="flex items-center gap-1.5" aria-hidden="true">
			<span class={['size-1.5 rounded-full transition-colors duration-200', !s.batchMode ? 'bg-accent' : 'bg-stone-600']}></span>
			<span class={['size-1.5 rounded-full transition-colors duration-200', s.batchMode ? 'bg-accent' : 'bg-stone-600']}></span>
		</div>
	</div>

	<!-- Quick roll overlays -->
	{#if s.quickRollDie !== null}
		<QuickRollOverlay die={s.quickRollDie} onComplete={(v) => s.onQuickRollDone(v)} />
	{/if}
	{#if s.quickBatchRolling}
		<QuickBatchRollOverlay dice={s.quickBatchQueue} onComplete={(r) => s.onQuickBatchAllDone(r)} />
	{/if}

	<!-- Swipe-enabled dice grid -->
	<div
		bind:this={swipeEl}
		role="group"
		onpointerdown={onSwipeStart}
		onpointermove={onSwipeMove}
		onpointerup={onSwipeEnd}
		class={['rounded-xl border-2 transition-colors duration-300', s.batchMode ? 'border-accent' : 'border-stone-700']}
		style="touch-action: pan-y"
	>
		<DiceGrid
			batchMode={s.batchMode}
			pressing={s.pressing}
			selectedDie={s.selectedDie}
			quickBatchQueue={s.quickBatchQueue}
			batchEntries={s.batchEntries}
			sessionRolls={s.sessionRolls}
			onDieClick={(die) => s.handleDieClick(die)}
			onConfirm={(roll) => s.addToSession(roll)}
			onCancel={() => (s.selectedDie = null)}
		/>
	</div>

	<!-- Quick batch queue (Battle+Quick mode) -->
	{#if s.batchMode && app.rollMode && s.quickBatchQueue.length > 0 && !s.quickBatchRolling}
		<QuickBatchQueuePanel
			queue={s.quickBatchQueue}
			onRollAll={() => {
				s.quickBatchRolling = true;
			}}
			onClear={() => {
				s.quickBatchQueue = [];
			}}
		/>
	{/if}

	<!-- Battle+Log batch panel -->
	{#if s.batchMode && !app.rollMode && s.batchEntries.length > 0}
		<BatchEntryPanel
			bind:entries={s.batchEntries}
			onConfirm={(rolls) => s.addBatchToSession(rolls)}
		/>
	{/if}

	<!-- Save error -->
	{#if app.session.saveError}
		<p class="rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-400">{app.session.saveError}</p>
	{/if}

	<!-- Active session -->
	<ActiveSessionPanel />
</div>

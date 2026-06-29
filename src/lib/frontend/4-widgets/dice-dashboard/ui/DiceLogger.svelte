<script lang="ts">
	import { ActiveSessionPanel } from '@fe-features/active-session';
	import {
		QuickBatchQueuePanel,
		QuickBatchRollOverlay,
		QuickRollOverlay
	} from '@fe-features/roll-auto';
	import { BatchEntryPanel } from '@fe-features/roll-entry';
	import { getAppContext } from '@fe-shared/context';

	import { DiceLoggerState } from '../state/diceLogger.svelte';
	import { SwipeGesture } from '../state/swipeGesture.svelte';
	import Grid from './DiceLogger.Grid.svelte';
	import ModeLabel from './DiceLogger.ModeLabel.svelte';
	import ModePills from './DiceLogger.ModePills.svelte';
	import SessionHeader from './DiceLogger.SessionHeader.svelte';

	const app = getAppContext();
	const s = new DiceLoggerState(app);
	const swipe = new SwipeGesture();

	const gradientProgress = $derived(
		(() => {
			const base = s.batchMode ? 1 : 0;
			if (!swipe.isSwiping || swipe.containerWidth === 0) return base;
			const drag = swipe.swipeDeltaX / (swipe.containerWidth * 0.55);
			return Math.max(0, Math.min(1, base + drag));
		})()
	);

	const singleRollOpacity = $derived(1 - gradientProgress);
	const multiRollOpacity = $derived(gradientProgress);
</script>

<div class="flex flex-col gap-6 px-4 py-6">
	<SessionHeader {s} />

	<ModeLabel
		singleOpacity={singleRollOpacity}
		multiOpacity={multiRollOpacity}
		{gradientProgress}
		isSwiping={swipe.isSwiping}
		bind:containerWidth={swipe.containerWidth}
		onpointerdown={(e) => swipe.onStart(e)}
		onpointermove={(e) => swipe.onMove(e)}
		onpointerup={(e) => swipe.onEnd(e, (toRight) => s.setMode(toRight))}
		onpointercancel={(e) => swipe.onEnd(e, () => {})}
	/>

	{#if s.quickRollDie !== null}
		<QuickRollOverlay die={s.quickRollDie} onComplete={(v) => s.onQuickRollDone(v)} />
	{/if}
	{#if s.quickBatchRolling}
		<QuickBatchRollOverlay dice={s.quickBatchQueue} onComplete={(r) => s.onQuickBatchAllDone(r)} />
	{/if}

	<div class="relative rounded-xl transition-colors duration-300">
		<Grid
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

	<ModePills
		batchMode={s.batchMode}
		onSetMode={(batch) => s.setMode(batch)}
		onpointerdown={(e) => swipe.onStart(e)}
		onpointermove={(e) => swipe.onMove(e)}
		onpointerup={(e) => swipe.onEnd(e, (toRight) => s.setMode(toRight))}
		onpointercancel={(e) => swipe.onEnd(e, () => {})}
	/>

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

	{#if s.batchMode && !app.rollMode && s.batchEntries.length > 0}
		<BatchEntryPanel
			bind:entries={s.batchEntries}
			onConfirm={(rolls) => s.addBatchToSession(rolls)}
		/>
	{/if}

	{#if app.session.saveError}
		<p class="rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-400">{app.session.saveError}</p>
	{/if}

	<ActiveSessionPanel />
</div>

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

	let swipeStartX = 0;
	let swipeStartY = 0;
	let pointerIsDown = false;
	let isSwiping = $state(false);
	let swipeDeltaX = $state(0);
	let containerWidth = $state(0);

	function onSwipeStart(e: PointerEvent) {
		pointerIsDown = true;
		swipeStartX = e.clientX;
		swipeStartY = e.clientY;
		isSwiping = false;
	}

	function onSwipeMove(e: PointerEvent) {
		if (!pointerIsDown) return;
		const el = e.currentTarget as HTMLElement;
		const dx = e.clientX - swipeStartX;
		const dy = e.clientY - swipeStartY;
		if (!isSwiping && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
			isSwiping = true;
			el.setPointerCapture(e.pointerId);
		}
		if (isSwiping) swipeDeltaX = dx;
	}

	function onSwipeEnd(e: PointerEvent) {
		pointerIsDown = false;
		if (!isSwiping) return;
		const dx = e.clientX - swipeStartX;
		if (Math.abs(dx) > 40) s.setMode(!s.batchMode);
		isSwiping = false;
		swipeDeltaX = 0;
	}

	const gradientProgress = $derived(
		(() => {
			const base = s.batchMode ? 1 : 0;
			if (!isSwiping || containerWidth === 0) return base;
			const drag = swipeDeltaX / (containerWidth * 0.55);
			return Math.max(0, Math.min(1, base + drag));
		})()
	);

	const singleRollOpacity = $derived(1 - gradientProgress);
	const multiRollOpacity = $derived(gradientProgress);
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

	<!-- Animated mode label -->
	<div
		class="flex flex-col"
		bind:clientWidth={containerWidth}
		role="group"
		aria-label="Mode selector — swipe to switch"
		style="touch-action: pan-y"
		onpointerdown={onSwipeStart}
		onpointermove={onSwipeMove}
		onpointerup={onSwipeEnd}
		onpointercancel={onSwipeEnd}
	>
		<div class="relative h-7">
			<div
				class={[
					'absolute left-0 flex items-center gap-2 transition-all duration-300',
					singleRollOpacity > 0.5 ? 'text-accent' : 'text-stone-500'
				]}
				style={`opacity: ${singleRollOpacity}; pointer-events: ${singleRollOpacity > 0.1 ? 'auto' : 'none'};`}
			>
				<span class="mdi mdi-hexagon text-sm" aria-hidden="true"></span>
				<span class="text-sm font-semibold">Single Roll</span>
			</div>
			<div
				class={[
					'absolute right-0 flex items-center gap-2 transition-all duration-300',
					multiRollOpacity > 0.5 ? 'text-accent' : 'text-stone-500'
				]}
				style={`opacity: ${multiRollOpacity}; pointer-events: ${multiRollOpacity > 0.1 ? 'auto' : 'none'};`}
			>
				<span class="text-sm font-semibold">Multi Roll</span>
				<span class="mdi mdi-hexagon-multiple-outline text-sm" aria-hidden="true"></span>
			</div>
		</div>

		<!-- Animated gradient edge indicating mode + swipe affordance -->
		<div
			class={[
				'accent-gradient h-1.5 overflow-hidden rounded-full',
				!isSwiping && 'gradient-animate'
			]}
			style={`--gradient-pos: ${gradientProgress * 100}%;`}
		></div>
	</div>

	<!-- Quick roll overlays -->
	{#if s.quickRollDie !== null}
		<QuickRollOverlay die={s.quickRollDie} onComplete={(v) => s.onQuickRollDone(v)} />
	{/if}
	{#if s.quickBatchRolling}
		<QuickBatchRollOverlay dice={s.quickBatchQueue} onComplete={(r) => s.onQuickBatchAllDone(r)} />
	{/if}

	<!-- Dice grid -->
	<div class={['relative rounded-xl transition-colors duration-300']}>
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

	<!-- Mode pills with flanking icons -->
	<div
		class="flex items-center justify-center gap-3"
		role="group"
		aria-label="Mode selector — swipe to switch"
		style="touch-action: pan-y"
		onpointerdown={onSwipeStart}
		onpointermove={onSwipeMove}
		onpointerup={onSwipeEnd}
		onpointercancel={onSwipeEnd}
	>
		<button
			type="button"
			onclick={() => s.setMode(false)}
			class="flex items-center justify-center"
			aria-label="Single roll mode"
		>
			<span
				class={[
					'mdi mdi-hexagon-outline transition-all duration-200',
					!s.batchMode ? 'text-accent scale-125' : 'scale-100 text-stone-600'
				]}
				style="transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1)"
				aria-hidden="true"
			></span>
		</button>

		<div class="flex items-center gap-1.5">
			<button
				type="button"
				onclick={() => s.setMode(false)}
				class={[
					'h-1.5 w-6 rounded-full transition-colors duration-300',
					!s.batchMode ? 'bg-accent' : 'bg-stone-600'
				]}
				aria-label="Single roll mode"
			></button>
			<button
				type="button"
				onclick={() => s.setMode(true)}
				class={[
					'h-1.5 w-6 rounded-full transition-colors duration-300',
					s.batchMode ? 'bg-accent' : 'bg-stone-600'
				]}
				aria-label="Batch roll mode"
			></button>
		</div>

		<button
			type="button"
			onclick={() => s.setMode(true)}
			class="flex items-center justify-center"
			aria-label="Batch roll mode"
		>
			<span
				class={[
					'mdi mdi-hexagon-multiple-outline transition-all duration-200',
					s.batchMode ? 'text-accent scale-125' : 'scale-100 text-stone-600'
				]}
				style="transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1)"
				aria-hidden="true"
			></span>
		</button>
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

<style>
	:global(.gradient-animate) {
		transition: --gradient-pos 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	:global(.accent-gradient) {
		background: linear-gradient(
			90deg,
			transparent calc(var(--gradient-pos) - 40%),
			color-mix(in srgb, var(--accent) 60%, transparent) var(--gradient-pos),
			transparent calc(var(--gradient-pos) + 40%)
		);
	}
</style>

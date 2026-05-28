<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { backOut, cubicOut } from 'svelte/easing';
	import { DIE_COLOR } from '$lib/frontend/shared/ui/dice-colors';
	import DiceHistory from './DiceHistory.svelte';

	type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;
	interface RollResult { dieType: DieType; value: number; note: string; }

	let {
		die,
		rightHanded = false,
		isGuest = false,
		sessionRolls = [],
		onConfirm,
		onCancel
	}: {
		die: DieType;
		rightHanded?: boolean;
		isGuest?: boolean;
		sessionRolls?: RollResult[];
		onConfirm: (roll: RollResult) => void;
		onCancel: () => void;
	} = $props();

	let sliderValue = $state(Math.ceil(die / 2));
	let rollNote    = $state('');
	let dieTab      = $state<'roll' | 'history'>('roll');

	const DIE_BORDER: Record<DieType, string> = {
		4: 'border-red-500/70 text-red-400',
		6: 'border-orange-500/70 text-orange-400',
		8: 'border-yellow-500/70 text-yellow-400',
		10: 'border-green-500/70 text-green-400',
		12: 'border-teal-500/70 text-teal-400',
		20: 'border-amber-400/70 text-amber-400',
		100: 'border-purple-500/70 text-purple-400'
	};

	function confirmRoll() {
		onConfirm({ dieType: die, value: sliderValue, note: rollNote.trim() });
	}
</script>

<!-- Backdrop -->
<button
	type="button"
	class="fixed inset-0 z-10 cursor-default"
	onclick={onCancel}
	aria-label="Dismiss"
	in:fade={{ duration: 150 }}
	out:fade={{ duration: 120 }}
></button>

<!-- Card -->
<div
	in:scale={{ start: 0.55, duration: 340, easing: backOut }}
	out:scale={{ start: 0.65, duration: 180, easing: cubicOut }}
	class="absolute inset-x-0 top-0 z-20 rounded-3xl border-2 bg-slate-800 p-5 shadow-2xl {DIE_BORDER[die]}"
>
	<!-- Header -->
	<div class="mb-3 flex items-center justify-between">
		<p class="text-4xl font-black" style="color: {DIE_COLOR[die]}">d{die}</p>
		<button
			type="button"
			onclick={onCancel}
			class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-700 hover:text-white active:scale-90"
			aria-label="Close">✕</button
		>
	</div>

	<!-- Tab bar (logged-in only) -->
	{#if !isGuest}
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
				onclick={() => (dieTab = 'history')}
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
				class="flex flex-col justify-between py-1 text-sm font-semibold text-slate-500"
				class:items-end={!rightHanded}
				class:items-start={rightHanded}
			>
				<span>{die}</span>
				<span>1</span>
			</div>
			<div class="flex flex-1 items-center justify-center">
				<input
					type="range"
					min="1"
					max={die}
					bind:value={sliderValue}
					style="writing-mode: vertical-lr; direction: rtl; height: 200px; width: 44px; cursor: pointer; accent-color: {DIE_COLOR[die]};"
					aria-label="Roll value"
				/>
			</div>
			<div class="flex w-20 flex-col items-center justify-center gap-1">
				<span class="text-6xl leading-none font-black text-white">{sliderValue}</span>
				{#if die === 20}
					{#if sliderValue === 20}
						<span in:fade={{ duration: 120 }} class="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-400">NAT 20!</span>
					{:else if sliderValue === 1}
						<span in:fade={{ duration: 120 }} class="rounded-full bg-red-900/40 px-2 py-0.5 text-xs font-bold text-red-400">NAT 1</span>
					{/if}
				{/if}
			</div>
		</div>

		<input
			type="text"
			bind:value={rollNote}
			placeholder="Note for this roll (optional)"
			class="mt-4 w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 focus:outline-none"
		/>

		<button
			type="button"
			onclick={confirmRoll}
			class="mt-3 w-full rounded-2xl py-4 text-base font-black text-slate-900 shadow-lg transition hover:brightness-110 active:scale-95"
			style="background: {DIE_COLOR[die]};">Log Roll</button
		>
	{:else}
		<DiceHistory {die} {sessionRolls} />
	{/if}
</div>

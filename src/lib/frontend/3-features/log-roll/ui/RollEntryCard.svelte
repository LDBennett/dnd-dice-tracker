<script lang="ts">
	import { DieValuePicker } from '@fe-entities/die';
	import { getAppContext } from '@fe-shared/context';
	import type { DieType, RollResult } from '@fe-shared/lib';
	import { Button, DIE_COLOR, IconButton, TabBar, TextInput } from '@fe-shared/ui';
	import { untrack } from 'svelte';
	import { backOut, cubicOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';

	import DiceHistory from './DiceHistory.svelte';

	let {
		die,
		sessionRolls = [],
		onConfirm,
		onCancel
	}: {
		die: DieType;
		sessionRolls?: RollResult[];
		onConfirm: (roll: RollResult) => void;
		onCancel: () => void;
	} = $props();

	const app = getAppContext();

	let sliderValue = $state(untrack(() => Math.ceil(die / 2)));
	let rollNote = $state('');
	let dieTab = $state<'roll' | 'history'>('roll');

	const DIE_BORDER: Record<DieType, string> = {
		4: 'border-red-500/70 text-red-400',
		6: 'border-blue-500/70 text-blue-400',
		8: 'border-green-500/70 text-green-400',
		10: 'border-cyan-500/70 text-cyan-400',
		12: 'border-pink-500/70 text-pink-400',
		20: 'border-yellow-500/70 text-yellow-400',
		100: 'border-purple-500/70 text-purple-400'
	};

	const dieTabs = [
		{ value: 'roll', label: 'Roll' },
		{ value: 'history', label: 'History' }
	];

	function confirmRoll() {
		onConfirm({ dieType: die, value: sliderValue, note: rollNote.trim() });
	}
</script>

<!-- Backdrop -->
<button
	type="button"
	class="fixed inset-0 z-60 cursor-default bg-black/60 backdrop-blur-sm"
	onclick={onCancel}
	aria-label="Dismiss"
	in:fade={{ duration: 150 }}
	out:fade={{ duration: 120 }}
></button>

<!-- Card -->
<div
	in:scale={{ start: 0.55, duration: 340, easing: backOut }}
	out:scale={{ start: 0.65, duration: 180, easing: cubicOut }}
	class={[
		'fixed inset-x-4 top-16 z-70 mx-auto max-w-sm rounded-3xl border-2 bg-stone-800 p-5 shadow-2xl',
		DIE_BORDER[die]
	]}
>
	<!-- Header -->
	<div class="mb-3 flex items-center justify-between">
		<p class="text-4xl font-black" style="color: {DIE_COLOR[die]}">d{die}</p>
		<IconButton icon="mdi-close" onclick={onCancel} aria-label="Close" />
	</div>

	<!-- Tab bar (logged-in only) -->
	{#if !app.isGuest}
		<TabBar
			items={dieTabs}
			value={dieTab}
			onchange={(v) => (dieTab = v as 'roll' | 'history')}
			activeClass="bg-stone-900 text-white"
			class="mb-4"
		/>
	{/if}

	{#if dieTab === 'roll' || app.isGuest}
		<DieValuePicker dieType={die} bind:value={sliderValue} color={DIE_COLOR[die]} class="mx-3" />

		<TextInput
			bind:value={rollNote}
			placeholder="Note for this roll (optional)"
			class="mt-4 bg-stone-700"
		/>

		<Button
			variant="primary"
			fullWidth
			onclick={confirmRoll}
			style="background: {DIE_COLOR[die]};"
			class="mt-3">Log Roll</Button
		>
	{:else}
		<DiceHistory {die} {sessionRolls} />
	{/if}
</div>

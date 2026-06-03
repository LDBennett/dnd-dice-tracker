<script lang="ts">
	import { untrack } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { backOut, cubicOut } from 'svelte/easing';
	import { DIE_COLOR, IconButton, Button, TabBar, TextInput, Badge } from '@fe-shared/ui';
	import { getAppContext } from '@fe-shared/context';
	import DiceHistory from './DiceHistory.svelte';

	type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;
	interface RollResult { dieType: DieType; value: number; note: string; }

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

	let sliderValue    = $state(untrack(() => Math.ceil(die / 2)));
	let rollNote       = $state('');
	let dieTab         = $state<'roll' | 'history'>('roll');
	let editingNumber  = $state(false);

	function focusOnMount(node: HTMLElement) { node.focus(); }

	function commitNumber(raw: string) {
		const n = parseInt(raw, 10);
		if (!isNaN(n)) sliderValue = Math.max(1, Math.min(die, n));
		editingNumber = false;
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
		<IconButton icon="mdi-close" onclick={onCancel} aria-label="Close" />
	</div>

	<!-- Tab bar (logged-in only) -->
	{#if !app.isGuest}
		<TabBar
			items={dieTabs}
			value={dieTab}
			onchange={(v) => (dieTab = v as 'roll' | 'history')}
			activeClass="bg-slate-900 text-white"
			class="mb-4"
		/>
	{/if}

	{#if dieTab === 'roll' || app.isGuest}
		<!-- Slider + value -->
		<div class="flex items-stretch gap-4" class:flex-row-reverse={app.rightHanded}>
			<div
				class="flex flex-col justify-between py-1 text-sm font-semibold text-slate-500"
				class:items-end={!app.rightHanded}
				class:items-start={app.rightHanded}
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
				{#if editingNumber}
					<input
						type="number"
						min="1"
						max={die}
						value={sliderValue}
						use:focusOnMount
						onblur={(e) => commitNumber((e.target as HTMLInputElement).value)}
						onkeydown={(e) => {
							if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
							if (e.key === 'Escape') editingNumber = false;
						}}
						class="w-20 bg-transparent text-center text-5xl leading-none font-black text-white border-b-2 focus:outline-none"
						style="border-color: {DIE_COLOR[die]};"
					/>
				{:else}
					<button
						type="button"
						onclick={() => (editingNumber = true)}
						title="Tap to type a value"
						class="text-6xl leading-none font-black text-white transition hover:opacity-70 active:scale-95"
					>{sliderValue}</button>
				{/if}
				{#if die === 20}
					{#if sliderValue === 20}
						<span in:fade={{ duration: 120 }}>
							<Badge variant="warning" class="font-bold">NAT 20!</Badge>
						</span>
					{:else if sliderValue === 1}
						<span in:fade={{ duration: 120 }}>
							<Badge variant="danger" class="font-bold">NAT 1</Badge>
						</span>
					{/if}
				{/if}
			</div>
		</div>

		<TextInput
			bind:value={rollNote}
			placeholder="Note for this roll (optional)"
			class="mt-4 bg-slate-700"
		/>

		<Button variant="primary" fullWidth onclick={confirmRoll} style="background: {DIE_COLOR[die]};" class="mt-3">Log Roll</Button>
	{:else}
		<DiceHistory {die} {sessionRolls} />
	{/if}
</div>

<script lang="ts">
	import { untrack } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { backOut, cubicOut } from 'svelte/easing';
	import { DIE_COLOR, IconButton, Button, Badge } from '@fe-shared/ui';
	import { getAppContext } from '@fe-shared/context';

	type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

	let {
		dieType,
		currentValue,
		onConfirm,
		onCancel
	}: {
		dieType: DieType;
		currentValue: number;
		onConfirm: (value: number) => void;
		onCancel: () => void;
	} = $props();

	const app = getAppContext();

	let sliderValue   = $state(untrack(() => currentValue));
	let editingNumber = $state(false);
	const color = $derived(DIE_COLOR[dieType] ?? '#94a3b8');

	function focusOnMount(node: HTMLElement) { node.focus(); }

	function commitNumber(raw: string) {
		const n = parseInt(raw, 10);
		if (!isNaN(n)) sliderValue = Math.max(1, Math.min(dieType, n));
		editingNumber = false;
	}
	const isNat20 = $derived(dieType === 20 && sliderValue === 20);
	const isNat1 = $derived(dieType === 20 && sliderValue === 1);

	// Defer backdrop click readiness past the pointer event that opened this modal.
	// Without this, mouseup fires on the newly-inserted backdrop at the same screen
	// position as the pill, immediately closing the modal.
	let backdropReady = $state(false);
	$effect(() => {
		const t = setTimeout(() => (backdropReady = true), 0);
		return () => clearTimeout(t);
	});
</script>

<!-- Backdrop — z-60 so the card (z-70) wins all hit-testing inside its bounds -->
<button
	type="button"
	class="fixed inset-0 z-60 cursor-default backdrop-blur-sm"
	style="background: rgba(0,0,0,0.72);"
	onclick={() => { if (backdropReady) onCancel(); }}
	aria-label="Dismiss"
	in:fade={{ duration: 150 }}
	out:fade={{ duration: 120 }}
></button>

<!-- Card -->
<div
	in:scale={{ start: 0.55, duration: 340, easing: backOut }}
	out:scale={{ start: 0.65, duration: 180, easing: cubicOut }}
	class="fixed left-1/2 top-1/2 z-70 w-72 -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 bg-stone-800 p-5 shadow-2xl"
	style="border-color: {color}40;"
>
	<div class="mb-3 flex items-center justify-between">
		<p class="text-4xl font-black" style="color: {color}">d{dieType}</p>
		<IconButton icon="mdi-close" onclick={onCancel} aria-label="Close" />
	</div>

	<div class="flex items-stretch gap-4" class:flex-row-reverse={app.rightHanded}>
		<div
			class="flex flex-col justify-between py-1 text-sm font-semibold text-stone-500"
			class:items-end={!app.rightHanded}
			class:items-start={app.rightHanded}
		>
			<span>{dieType}</span>
			<span>1</span>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<input
				type="range"
				min="1"
				max={dieType}
				bind:value={sliderValue}
				style="writing-mode: vertical-lr; direction: rtl; height: 200px; width: 44px; cursor: pointer; accent-color: {color};"
				aria-label="Roll value"
			/>
		</div>
		<div class="flex w-20 flex-col items-center justify-center gap-1">
			{#if editingNumber}
				<input
					type="number"
					min="1"
					max={dieType}
					value={sliderValue}
					use:focusOnMount
					onblur={(e) => commitNumber((e.target as HTMLInputElement).value)}
					onkeydown={(e) => {
						if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
						if (e.key === 'Escape') editingNumber = false;
					}}
					class="w-20 bg-transparent text-center text-5xl leading-none font-black text-white border-b-2 focus:outline-none"
					style="border-color: {color};"
				/>
			{:else}
				<button
					type="button"
					onclick={() => (editingNumber = true)}
					title="Tap to type a value"
					class="text-6xl leading-none font-black text-white transition hover:opacity-70 active:scale-95"
				>{sliderValue}</button>
			{/if}
			{#if isNat20}
				<span in:fade={{ duration: 120 }}>
					<Badge variant="warning" class="font-bold">NAT 20!</Badge>
				</span>
			{:else if isNat1}
				<span in:fade={{ duration: 120 }}>
					<Badge variant="danger" class="font-bold">NAT 1</Badge>
				</span>
			{/if}
		</div>
	</div>

	<Button variant="primary" fullWidth onclick={() => onConfirm(sliderValue)} style="background: {color};" class="mt-4">Update Roll</Button>
</div>

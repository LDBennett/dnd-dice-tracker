<script lang="ts">
	import { DieValuePicker } from '@fe-entities/die';
	import type { DieType } from '@fe-shared';
	import { Button, DIE_COLOR, IconButton } from '@fe-shared/ui';
	import { untrack } from 'svelte';
	import { backOut, cubicOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';

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

	let sliderValue = $state(untrack(() => currentValue));
	const color = $derived(DIE_COLOR[dieType] ?? '#94a3b8');

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
	onclick={() => {
		if (backdropReady) onCancel();
	}}
	aria-label="Dismiss"
	in:fade={{ duration: 150 }}
	out:fade={{ duration: 120 }}
></button>

<!-- Card -->
<div
	in:scale={{ start: 0.55, duration: 340, easing: backOut }}
	out:scale={{ start: 0.65, duration: 180, easing: cubicOut }}
	class="fixed top-1/2 left-1/2 z-70 w-72 -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 bg-stone-800 p-5 shadow-2xl"
	style="border-color: {color}40;"
>
	<div class="mb-3 flex items-center justify-between">
		<p class="text-4xl font-black" style="color: {color}">d{dieType}</p>
		<IconButton icon="mdi-close" onclick={onCancel} aria-label="Close" />
	</div>

	<DieValuePicker {dieType} bind:value={sliderValue} {color} />

	<Button
		variant="primary"
		fullWidth
		onclick={() => onConfirm(sliderValue)}
		style="background: {color};"
		class="mt-4">Update Roll</Button
	>
</div>

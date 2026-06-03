<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { backOut, cubicOut } from 'svelte/easing';
	import Button from '../buttons/Button.svelte';

	let {
		title,
		message,
		confirmLabel = 'Delete',
		onConfirm,
		onCancel
	}: {
		title: string;
		message?: string;
		confirmLabel?: string;
		onConfirm: () => void;
		onCancel: () => void;
	} = $props();

	let backdropReady = $state(false);
	$effect(() => {
		const t = setTimeout(() => (backdropReady = true), 0);
		return () => clearTimeout(t);
	});
</script>

<button
	type="button"
	class="fixed inset-0 z-40 cursor-default backdrop-blur-sm"
	style="background: rgba(0,0,0,0.72);"
	onclick={() => { if (backdropReady) onCancel(); }}
	aria-label="Dismiss"
	in:fade={{ duration: 150 }}
	out:fade={{ duration: 120 }}
></button>

<div
	in:scale={{ start: 0.55, duration: 340, easing: backOut }}
	out:scale={{ start: 0.65, duration: 180, easing: cubicOut }}
	class="fixed left-1/2 top-1/2 z-50 w-72 -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 border-red-500/30 bg-stone-800 p-5 shadow-2xl"
>
	<p class="mb-1 text-lg font-black text-white">{title}</p>
	{#if message}
		<p class="mb-5 text-sm text-stone-400">{message}</p>
	{:else}
		<div class="mb-5"></div>
	{/if}
	<div class="flex gap-3">
		<Button fullWidth onclick={onCancel}>Cancel</Button>
		<Button variant="primary" fullWidth onclick={onConfirm} style="background: #ef4444;">
			{confirmLabel}
		</Button>
	</div>
</div>

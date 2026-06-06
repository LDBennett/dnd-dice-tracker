<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Snippet } from 'svelte';

	let {
		onclose,
		class: extraClass,
		label,
		children
	}: {
		onclose?: () => void;
		class?: string;
		label?: string;
		children: Snippet;
	} = $props();

	let backdropReady = $state(false);
	$effect(() => {
		const t = setTimeout(() => (backdropReady = true), 0);
		return () => clearTimeout(t);
	});
</script>

<button
	type="button"
	class="fixed inset-0 z-60 cursor-default bg-black/60 backdrop-blur-sm"
	onclick={() => {
		if (backdropReady && onclose) onclose();
	}}
	aria-label="Dismiss"
	in:fade={{ duration: 150 }}
	out:fade={{ duration: 120 }}
></button>

<div
	in:scale={{ start: 0.92, duration: 220, easing: cubicOut }}
	out:scale={{ start: 0.92, duration: 150, easing: cubicOut }}
	class={[
		'fixed inset-x-4 top-16 z-70 mx-auto max-w-sm rounded-3xl bg-stone-800 shadow-2xl',
		extraClass
	]}
	role="dialog"
	aria-modal="true"
	aria-label={label}
>
	{@render children()}
</div>

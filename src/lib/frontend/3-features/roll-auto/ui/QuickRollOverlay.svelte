<script lang="ts">
	import type { DieType } from '@fe-shared';
	import { Badge, DIE_COLOR } from '@fe-shared/ui';
	import { untrack } from 'svelte';
	import { backOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';

	let {
		die,
		onComplete
	}: {
		die: DieType;
		onComplete: (value: number) => void;
	} = $props();

	const finalValue = $derived(Math.floor(Math.random() * die) + 1);
	let displayValue = $state(untrack(() => Math.floor(Math.random() * die) + 1));
	let rolling = $state(true);
	let settled = $state(false);

	let frame = 0;
	const FRAMES = 18;

	function tick() {
		if (frame >= FRAMES) {
			rolling = false;
			displayValue = finalValue;
			setTimeout(() => {
				settled = true;
				setTimeout(() => onComplete(finalValue), 900);
			}, 80);
			return;
		}
		const t = frame / FRAMES;
		const delay = 45 + t * t * 260;
		displayValue = Math.floor(Math.random() * die) + 1;
		frame++;
		setTimeout(tick, delay);
	}

	tick();

	let isNat20 = $state(false);
	let isNat1 = $state(false);

	$effect(() => {
		isNat20 = finalValue === 20 && die === 20;
		isNat1 = finalValue === 1 && die === 20;
	});
</script>

<button
	type="button"
	class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
	style="background: rgba(0,0,0,0.72);"
	in:fade={{ duration: 150 }}
	out:fade={{ duration: 200 }}
	onclick={() => {
		if (!rolling) onComplete(finalValue);
	}}
	aria-label="Dismiss roll"
>
	<!-- Stop click-through on the card itself -->

	<div
		in:scale={{ start: 0.4, duration: 380, easing: backOut }}
		class="flex flex-col items-center gap-5 rounded-3xl border-2 bg-stone-800 px-10 py-8 shadow-2xl"
		style="border-color: {DIE_COLOR[die]}; min-width: 220px;"
		class:rolling
		onpointerdown={(event) => event.stopPropagation()}
		aria-label="Die roll result: {finalValue} on a d{die}"
		role="alert"
	>
		<p class="text-2xl font-extrabold" style="color: {DIE_COLOR[die]}">d{die}</p>

		<div class="flex h-28 items-center justify-center">
			{#if settled}
				<span
					in:scale={{ start: 0.2, duration: 500, easing: backOut }}
					class="text-9xl leading-none font-black tabular-nums"
					style="color: {DIE_COLOR[die]}">{finalValue}</span
				>
			{:else}
				<span class="text-9xl leading-none font-black text-white tabular-nums">{displayValue}</span>
			{/if}
		</div>

		<div class="flex h-7 items-center justify-center">
			{#if settled}
				<span in:fade={{ duration: 200 }}>
					{#if isNat20}
						<Badge variant="warning" class="flex items-center gap-2 px-3 py-1 text-sm font-bold"
							>NAT 20!
							<span class="mdi mdi-fire"></span></Badge
						>
					{:else if isNat1}
						<Badge variant="danger" class="flex items-center gap-2 px-3 py-1 text-sm font-bold"
							>NAT 1 <span class="mdi mdi-skull-outline"></span></Badge
						>
					{:else}
						<span class="text-xs text-stone-500">tap to dismiss</span>
					{/if}
				</span>
			{:else}
				<span class="text-sm text-stone-500">Rolling…</span>
			{/if}
		</div>
	</div>
</button>

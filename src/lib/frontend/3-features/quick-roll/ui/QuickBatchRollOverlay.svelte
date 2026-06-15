<script lang="ts">
	import type { DieType } from '@fe-shared';
	import { Badge,DIE_COLOR } from '@fe-shared/ui';
	import { onMount } from 'svelte';
	import { backOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';

	interface DieResult {
		dieType: DieType;
		value: number;
	}

	let {
		dice,
		onComplete
	}: {
		dice: DieType[];
		onComplete: (results: DieResult[]) => void;
	} = $props();

	const FRAMES = 18;

	interface DieState {
		dieType: DieType;
		finalValue: number;
		displayValue: number;
		rolling: boolean;
		settled: boolean;
		frame: number;
	}

	let dieStates = $state<DieState[]>([]);

	onMount(() => {
		dieStates = dice.map((dieType) => {
			const finalValue = Math.floor(Math.random() * dieType) + 1;
			return {
				dieType,
				finalValue,
				displayValue: Math.floor(Math.random() * dieType) + 1,
				rolling: true,
				settled: false,
				frame: 0
			};
		});

		dieStates.forEach((_, i) => tickDie(i));
	});

	let settledCount = $state(0);
	let allDone = $state(false);

	function tickDie(index: number) {
		if (dieStates[index].frame >= FRAMES) {
			dieStates[index].rolling = false;
			dieStates[index].displayValue = dieStates[index].finalValue;
			setTimeout(() => {
				dieStates[index].settled = true;
				settledCount += 1;
				if (settledCount === dieStates.length) {
					setTimeout(() => {
						allDone = true;
						setTimeout(
							() => onComplete(dieStates.map((d) => ({ dieType: d.dieType, value: d.finalValue }))),
							600
						);
					}, 200);
				}
			}, 80);
			return;
		}
		const t = dieStates[index].frame / FRAMES;
		const delay = 45 + t * t * 260;
		dieStates[index].displayValue = Math.floor(Math.random() * dieStates[index].dieType) + 1;
		dieStates[index].frame++;
		setTimeout(() => tickDie(index), delay);
	}

	function dismiss() {
		if (settledCount === dieStates.length) {
			onComplete(dieStates.map((d) => ({ dieType: d.dieType, value: d.finalValue })));
		}
	}
</script>

<button
	type="button"
	class="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto py-6 backdrop-blur-sm"
	style="background: rgba(0,0,0,0.82);"
	in:fade={{ duration: 150 }}
	out:fade={{ duration: 200 }}
	onclick={dismiss}
	aria-label="Dismiss batch roll"
>
	<div
		in:scale={{ start: 0.85, duration: 280, easing: backOut }}
		class="flex w-full max-w-sm flex-col items-center gap-4 px-4"
		onpointerdown={(e) => e.stopPropagation()}
		role="presentation"
	>
		<p class="text-xs font-semibold tracking-widest text-stone-400 uppercase">
			Rolling {dieStates.length}
			{dieStates.length === 1 ? 'die' : 'dice'}
		</p>

		<div
			class="grid w-full gap-3"
			style="grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));"
		>
			{#each dieStates as s, i (i)}
				<div
					class="flex flex-col items-center gap-2 rounded-2xl border-2 bg-stone-800 px-3 py-4 shadow-xl"
					style="border-color: {DIE_COLOR[s.dieType]};"
				>
					<p class="text-sm font-extrabold" style="color: {DIE_COLOR[s.dieType]}">d{s.dieType}</p>

					<div class="flex h-14 items-center justify-center">
						{#if s.settled}
							<span
								in:scale={{ start: 0.2, duration: 400, easing: backOut }}
								class="text-5xl leading-none font-black tabular-nums"
								style="color: {DIE_COLOR[s.dieType]}">{s.finalValue}</span
							>
						{:else}
							<span class="text-5xl leading-none font-black text-white tabular-nums"
								>{s.displayValue}</span
							>
						{/if}
					</div>

					{#if s.settled && s.dieType === 20}
						{#if s.finalValue === 20}
							<Badge variant="warning" class="font-bold">NAT 20!</Badge>
						{:else if s.finalValue === 1}
							<Badge variant="danger" class="font-bold">NAT 1</Badge>
						{/if}
					{/if}
				</div>
			{/each}
		</div>

		{#if allDone}
			<p in:fade={{ duration: 200 }} class="text-xs text-stone-500">tap to dismiss</p>
		{:else if settledCount === dieStates.length}
			<p class="text-xs text-stone-500">tap to dismiss</p>
		{:else}
			<p class="text-sm text-stone-500">Rolling…</p>
		{/if}
	</div>
</button>

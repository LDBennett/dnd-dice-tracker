<script lang="ts">
	import type { DieType } from '@fe-shared';
	import { getAppContext } from '@fe-shared/context';
	import { Badge } from '@fe-shared/ui';
	import { fade } from 'svelte/transition';

	let {
		dieType,
		value = $bindable(),
		color,
		class: extraClass
	}: {
		dieType: DieType;
		value: number;
		color: string;
		class?: string;
	} = $props();

	const app = getAppContext();
	let editingNumber = $state(false);

	const isNat20 = $derived(dieType === 20 && value === 20);
	const isNat1 = $derived(dieType === 20 && value === 1);

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	function commitNumber(raw: string) {
		const n = parseInt(raw, 10);
		if (!isNaN(n)) value = Math.max(1, Math.min(dieType, n));
		editingNumber = false;
	}
</script>

<div class={['flex items-stretch gap-4', app.rightHanded && 'flex-row-reverse', extraClass]}>
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
			bind:value
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
				{value}
				use:focusOnMount
				onblur={(e) => commitNumber((e.target as HTMLInputElement).value)}
				onkeydown={(e) => {
					if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
					if (e.key === 'Escape') editingNumber = false;
				}}
				class="w-20 [appearance:textfield] border-b-2 bg-transparent text-center text-5xl leading-none font-black text-white focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				style="border-color: {color};"
			/>
		{:else}
			<button
				type="button"
				onclick={() => (editingNumber = true)}
				title="Tap to type a value"
				class="text-6xl leading-none font-black text-white transition hover:opacity-70 active:scale-95"
				>{value}</button
			>
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

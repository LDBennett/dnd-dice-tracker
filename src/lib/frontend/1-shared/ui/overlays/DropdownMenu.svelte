<script lang="ts">
	import type { Snippet } from 'svelte';
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	export type DropdownItem = {
		label: string;
		icon: string;
		onclick: () => void;
		active?: boolean;
	};

	type Props = {
		items: DropdownItem[];
		direction?: 'down' | 'up';
		align?: 'left' | 'right' | 'center';
		trigger: Snippet<[() => void, boolean]>;
	};

	let { items, direction = 'down', align = 'right', trigger }: Props = $props();

	let open = $state(false);
	let container = $state<HTMLElement | null>(null);

	const panelClass = $derived([
		'absolute z-50 overflow-hidden rounded-2xl bg-stone-800 shadow-xl ring-1 ring-stone-700/60 min-w-36',
		direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1',
		align === 'center' ? 'left-1/2 -translate-x-1/2' : align === 'left' ? 'left-0' : 'right-0'
	]);

	$effect(() => {
		if (!open) return;
		function onDocClick(e: MouseEvent) {
			if (container?.contains(e.target as Node)) return;
			open = false;
		}
		window.addEventListener('click', onDocClick, { capture: true });
		return () => window.removeEventListener('click', onDocClick, { capture: true });
	});
</script>

<div class="relative" bind:this={container}>
	{@render trigger(() => (open = !open), open)}
	{#if open}
		<div transition:scale={{ duration: 250, start: 0.5, easing: backOut }} class={panelClass}>
			{#each items as item (item.label)}
				<button
					type="button"
					onclick={() => {
						item.onclick();
						open = false;
					}}
					class={[
						'flex w-full items-center gap-2.5 px-5 py-3 text-sm font-semibold transition hover:bg-stone-700 active:scale-95',
						item.active ? 'text-accent' : 'text-stone-400'
					]}
				>
					<span class={['mdi text-base', item.icon]}></span>
					{item.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

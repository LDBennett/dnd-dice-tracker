<script lang="ts">
	import { browser } from '$app/environment';
	import TextInput from './TextInput.svelte';
	import type { SelectOption } from '../../lib/types/api-types';

	let {
		options,
		value = $bindable<string | null>(null),
		placeholder = 'Select…',
		class: extraClass
	}: {
		options: SelectOption[];
		value?: string | null;
		placeholder?: string;
		class?: string;
	} = $props();

	let open = $state(false);
	let query = $state('');
	let container = $state<HTMLElement | null>(null);

	const selectedLabel = $derived(options.find((o) => o.value === value)?.label ?? null);

	const filtered = $derived(
		query.trim() === ''
			? options
			: options.filter(
					(o) =>
						o.label.toLowerCase().includes(query.toLowerCase()) ||
						(o.subtext ?? '').toLowerCase().includes(query.toLowerCase())
				)
	);

	function toggle() {
		open = !open;
		if (!open) query = '';
	}

	function select(opt: SelectOption) {
		value = opt.value;
		open = false;
		query = '';
	}

	$effect(() => {
		if (!browser || !open) return;
		function onDocClick(e: MouseEvent) {
			if (container?.contains(e.target as Node)) return;
			open = false;
			query = '';
		}
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	});
</script>

<div bind:this={container} class={['relative', extraClass]}>
	<button
		type="button"
		onclick={toggle}
		class="flex h-12 w-full items-center justify-between rounded-xl bg-stone-800 px-4 text-sm ring-1 ring-stone-700 transition hover:ring-stone-500"
	>
		<span class={[selectedLabel ? 'text-white' : 'text-stone-500']}>
			{selectedLabel ?? placeholder}
		</span>
		<span class={['mdi mdi-chevron-down text-stone-400 transition-transform', open && 'rotate-180']}
		></span>
	</button>

	{#if open}
		<div class="absolute z-50 mt-1 w-full rounded-xl bg-stone-800 shadow-xl ring-1 ring-stone-700">
			<div class="p-2">
				<TextInput bind:value={query} placeholder="Search…" />
			</div>
			<ul class="max-h-64 overflow-y-auto pb-2">
				{#each filtered as opt (opt.value)}
					<li>
						<button
							type="button"
							onclick={() => select(opt)}
							class={[
								'flex min-h-12 w-full flex-col justify-center px-4 py-2.5 text-left text-sm transition hover:bg-stone-700',
								opt.value === value ? 'text-orange-400' : 'text-white'
							]}
						>
							<span class="font-semibold">{opt.label}</span>
							{#if opt.subtext}
								<span class="text-xs text-stone-500">{opt.subtext}</span>
							{/if}
						</button>
					</li>
				{/each}
				{#if filtered.length === 0}
					<li class="px-4 py-3 text-sm text-stone-500">No sessions found</li>
				{/if}
			</ul>
		</div>
	{/if}
</div>

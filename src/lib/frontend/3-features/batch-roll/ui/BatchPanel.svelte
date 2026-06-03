<script lang="ts">
	import { DIE_COLOR, Button, IconButton, TextInput, Badge } from '@fe-shared/ui';

	type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;
	interface BatchEntry {
		id: number;
		dieType: DieType;
		value: number;
	}
	interface RollResult {
		dieType: DieType;
		value: number;
		note: string;
	}

	let {
		entries = $bindable<BatchEntry[]>([]),
		onConfirm
	}: {
		entries: BatchEntry[];
		onConfirm: (rolls: RollResult[]) => void;
	} = $props();

	let batchNote = $state('');
	let quickFill = $state('');

	const batchTotal = $derived(entries.reduce((s, e) => s + e.value, 0));

	const quickFillValidation = $derived(
		quickFill.trim()
			? quickFill
					.split(/[\s,]+/)
					.map((n) => parseInt(n, 10))
					.filter((n) => !isNaN(n))
					.map((value, i) => {
						const entry = entries[i];
						return entry
							? {
									value,
									dieType: entry.dieType as DieType | null,
									valid: value >= 1 && value <= entry.dieType
								}
							: { value, dieType: null as DieType | null, valid: false };
					})
			: ([] as Array<{ value: number; dieType: DieType | null; valid: boolean }>)
	);

	const quickFillReady = $derived(
		quickFillValidation.length === entries.length &&
			entries.length > 0 &&
			quickFillValidation.every((item) => item.valid)
	);

	function remove(id: number) {
		entries = entries.filter((e) => e.id !== id);
	}

	function setValue(id: number, value: number) {
		entries = entries.map((e) =>
			e.id === id ? { ...e, value: Math.max(1, Math.min(e.dieType, value)) } : e
		);
	}

	function step(id: number, delta: number) {
		entries = entries.map((e) => {
			if (e.id !== id) return e;
			return { ...e, value: Math.max(1, Math.min(e.dieType, e.value + delta)) };
		});
	}

	function applyQuickFill() {
		const nums = quickFill
			.split(/[\s,]+/)
			.map((n) => parseInt(n, 10))
			.filter((n) => !isNaN(n) && n > 0);
		if (nums.length === 0) return;
		entries = entries.map((e, i) =>
			i < nums.length ? { ...e, value: Math.max(1, Math.min(e.dieType, nums[i])) } : e
		);
		quickFill = '';
	}

	function confirm() {
		if (entries.length === 0) return;
		onConfirm(entries.map((e) => ({ dieType: e.dieType, value: e.value, note: batchNote.trim() })));
		entries = [];
		batchNote = '';
	}
</script>

<div class="rounded-2xl bg-slate-800 p-4">
	<h3 class="mb-3 text-sm font-semibold text-slate-300">Battle rolls</h3>

	<div class="mb-3 flex flex-col gap-3">
		{#each entries as entry (entry.id)}
			<div class="rounded-xl bg-slate-700/50 p-3">
				<input
					type="range"
					min="1"
					max={entry.dieType}
					value={entry.value}
					oninput={(e) => setValue(entry.id, parseInt(e.currentTarget.value))}
					style="accent-color: {DIE_COLOR[entry.dieType]}; width: 100%;"
					class="mb-2 block"
					aria-label="Roll value for d{entry.dieType}"
				/>
				<div class="flex items-center gap-3">
					<span
						class="shrink-0 rounded-full px-2.5 py-1 text-xs font-black text-slate-900"
						style="background: {DIE_COLOR[entry.dieType]}">d{entry.dieType}</span
					>
					<div
						class="flex flex-1 items-center justify-center gap-3 rounded-xl bg-slate-700 px-2 py-1"
					>
						<button
							type="button"
							onclick={() => step(entry.id, -1)}
							class="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-300 transition hover:bg-slate-600 active:scale-90"
							aria-label="Decrease"><span class="mdi mdi-minus"></span></button
						>
						<span class="min-w-[3ch] text-center text-xl font-black text-white">{entry.value}</span>
						<button
							type="button"
							onclick={() => step(entry.id, 1)}
							class="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-300 transition hover:bg-slate-600 active:scale-90"
							aria-label="Increase">+</button
						>
					</div>
					<IconButton icon="mdi-close" onclick={() => remove(entry.id)} aria-label="Remove" />
				</div>
			</div>
		{/each}
	</div>

	<!-- Quick fill -->
	<div class="mb-4">
		<div class="flex gap-2">
			<TextInput
				bind:value={quickFill}
				placeholder="Quick fill: 14, 6, 3"
				class="min-w-0 flex-1"
			/>
			<button
				type="button"
				onclick={applyQuickFill}
				disabled={!quickFillReady}
				class="shrink-0 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-600 hover:text-white disabled:opacity-40"
				>Apply</button
			>
		</div>
		{#if quickFillValidation.length > 0}
			<div class="mt-2 flex flex-wrap gap-1.5">
				{#each quickFillValidation as item, i (i)}
					{#if item.dieType !== null}
						<Badge variant={item.valid ? 'success' : 'danger'}>
							d{item.dieType}: {item.value}
							{#if item.valid}
								<span class="mdi mdi-check"></span>
							{:else}
								<span class="mdi mdi-close"></span> (max {item.dieType})
							{/if}
						</Badge>
					{:else}
						<Badge variant="neutral">{item.value} – no die</Badge>
					{/if}
				{/each}
				{#if entries.length > quickFillValidation.length}
					<span class="rounded-full bg-slate-700/60 px-2.5 py-0.5 text-xs text-slate-500">
						+{entries.length - quickFillValidation.length} unfilled
					</span>
				{/if}
			</div>
		{/if}
	</div>

	<p class="mb-3 text-sm text-slate-400">
		Total: <span class="font-black text-amber-400">{batchTotal}</span>
	</p>

	<TextInput
		bind:value={batchNote}
		placeholder="Note for all rolls (optional)"
		class="mb-3 bg-slate-700"
	/>

	<Button variant="primary" fullWidth onclick={confirm}>
		Add {entries.length} {entries.length === 1 ? 'roll' : 'rolls'} to session
	</Button>
</div>

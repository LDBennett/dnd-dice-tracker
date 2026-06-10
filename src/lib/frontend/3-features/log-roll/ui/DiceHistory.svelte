<script lang="ts">
	import type { DieType, RollResult } from '@fe-shared/lib';
	import { fmtDate } from '@fe-shared/lib';

	interface HistoryEntry {
		value: number;
		note: string;
		date: string;
	}

	let {
		die,
		sessionRolls = []
	}: {
		die: DieType;
		sessionRolls?: RollResult[];
	} = $props();

	let historyRolls = $state<HistoryEntry[]>([]);
	let historyLoading = $state(false);

	$effect(() => {
		loadHistory();
	});

	async function loadHistory() {
		historyLoading = true;
		historyRolls = [];
		try {
			const res = await fetch('/api/rolls');
			if (res.ok) {
				const sessions = (await res.json()) as Array<{
					rolls: Array<{ dieType: number; value: number; note: string }>;
					rolledAt: string;
				}>;
				historyRolls = sessions.flatMap((s) =>
					s.rolls
						.filter((r) => r.dieType === die)
						.map((r) => ({ value: r.value, note: r.note, date: s.rolledAt }))
				);
			}
		} finally {
			historyLoading = false;
		}
	}
</script>

<div class="flex max-h-72 flex-col gap-4 overflow-y-auto pr-1">
	{#if sessionRolls.length > 0}
		<div>
			<p class="mb-1.5 text-xs font-semibold tracking-wider text-stone-500 uppercase">
				This session
			</p>
			<div class="flex flex-col gap-1.5">
				{#each sessionRolls as r, i (i)}
					<div class="flex items-center gap-3">
						<span class="w-8 text-right text-xl font-black text-white">{r.value}</span>
						{#if r.note}<span class="text-xs text-stone-400">{r.note}</span>{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
	<div>
		<p class="mb-1.5 text-xs font-semibold tracking-wider text-stone-500 uppercase">Overall</p>
		{#if historyLoading}
			<p class="text-xs text-stone-500">Loading…</p>
		{:else if historyRolls.length === 0}
			<p class="text-xs text-stone-500">No past rolls for d{die}.</p>
		{:else}
			<div class="flex flex-col gap-1.5">
				{#each historyRolls as h, i (i)}
					<div class="flex items-center justify-between gap-2">
						<div class="flex items-center gap-3">
							<span class="w-8 text-right text-xl font-black text-white">{h.value}</span>
							{#if h.note}<span class="text-xs text-stone-400">{h.note}</span>{/if}
						</div>
						<span class="shrink-0 text-xs text-stone-600">{fmtDate(h.date)}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

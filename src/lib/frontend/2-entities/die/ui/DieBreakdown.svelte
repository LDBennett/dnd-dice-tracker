<script lang="ts">
	import type { BreakdownEntry } from '@fe-shared/lib';
	import { DIE_COLOR } from '@fe-shared/ui';
	import { fmtLuck, luckClass } from '@fe-shared/lib';

	let { breakdown }: { breakdown: BreakdownEntry[] } = $props();

	function color(t: number) { return DIE_COLOR[t] ?? '#94a3b8'; }
	function theoreticalAvg(t: number) { return (t + 1) / 2; }
	function luck(entry: BreakdownEntry) { return Number((entry.avg - theoreticalAvg(entry.dieType)).toFixed(2)); }
</script>

<div class="mt-6">
	<h3 class="mb-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">Die Breakdown</h3>
	<div class="grid grid-cols-2 gap-2">
		{#each breakdown as entry (entry.dieType)}
			{@const luckScore = luck(entry)}
			<div class="rounded-2xl bg-slate-800 px-4 py-3">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-sm font-bold" style="color: {color(entry.dieType)}">d{entry.dieType}</span>
					<div class="flex items-center gap-3 text-xs text-slate-400">
						<span>{entry.count} {entry.count === 1 ? 'roll' : 'rolls'}</span>
						<span class="font-semibold text-white">avg {entry.avg}</span>
						<span class={['font-semibold', luckClass(luckScore)]} title="luck vs expected {theoreticalAvg(entry.dieType)}">{fmtLuck(luckScore)}</span>
					</div>
				</div>
				<div class="h-1.5 overflow-hidden rounded-full bg-slate-700">
					<div
						class="h-full rounded-full"
						style="width: {(entry.avg / entry.dieType) * 100}%; background: {color(entry.dieType)}; opacity: 0.7;"
					></div>
				</div>
			</div>
		{/each}
	</div>
</div>

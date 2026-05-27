<script lang="ts">
	interface BreakdownEntry { dieType: number; count: number; avg: number; }

	let { breakdown }: { breakdown: BreakdownEntry[] } = $props();

	const DIE_COLOR: Record<number, string> = {
		4: '#f87171', 6: '#fb923c', 8: '#facc15',
		10: '#4ade80', 12: '#2dd4bf', 20: '#fbbf24', 100: '#c084fc'
	};
	function color(t: number) { return DIE_COLOR[t] ?? '#94a3b8'; }
	function theoreticalAvg(t: number) { return (t + 1) / 2; }
	function luck(entry: BreakdownEntry) { return Number((entry.avg - theoreticalAvg(entry.dieType)).toFixed(2)); }
	function fmtLuck(n: number) { return (n >= 0 ? '+' : '') + n.toFixed(2); }
	function luckClass(n: number) { return n > 0.1 ? 'text-green-400' : n < -0.1 ? 'text-red-400' : 'text-slate-500'; }
</script>

<div class="mt-6">
	<h3 class="mb-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">Die Breakdown</h3>
	<div class="flex flex-col gap-2">
		{#each breakdown as entry (entry.dieType)}
			{@const luckScore = luck(entry)}
			<div class="rounded-2xl bg-slate-800 px-4 py-3">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-sm font-bold" style="color: {color(entry.dieType)}">d{entry.dieType}</span>
					<div class="flex items-center gap-3 text-xs text-slate-400">
						<span>{entry.count} {entry.count === 1 ? 'roll' : 'rolls'}</span>
						<span class="font-semibold text-white">avg {entry.avg}</span>
						<span class="font-semibold {luckClass(luckScore)}" title="luck vs expected {theoreticalAvg(entry.dieType)}">{fmtLuck(luckScore)}</span>
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

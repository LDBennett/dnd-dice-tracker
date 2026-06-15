<script lang="ts">
	import type { BreakdownEntry } from '@fe-shared';
	import { fmtLuck, luckClass } from '@fe-shared';
	import { DIE_COLOR, DieIcon } from '@fe-shared/ui';

	let { breakdown }: { breakdown: BreakdownEntry[] } = $props();

	let containerEl: HTMLElement | undefined;
	let visible = $state(false);

	$effect(() => {
		if (!containerEl) return;
		const navEl = document.querySelector('nav');
		const navHeight = navEl ? navEl.getBoundingClientRect().height : 80;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					visible = true;
					observer.disconnect();
				}
			},
			{ threshold: 0, rootMargin: `0px 0px -${Math.round(navHeight)}px 0px` }
		);
		observer.observe(containerEl);
		return () => observer.disconnect();
	});

	function color(t: number) {
		return DIE_COLOR[t] ?? '#94a3b8';
	}
	function theoreticalAvg(t: number) {
		return (t + 1) / 2;
	}
	function luck(entry: BreakdownEntry) {
		return Number((entry.avg - theoreticalAvg(entry.dieType)).toFixed(2));
	}
</script>

<div bind:this={containerEl} class="mt-6">
	<h3 class="mb-3 text-xs font-semibold tracking-widest text-stone-500 uppercase">Die Breakdown</h3>
	<div class="grid grid-cols-2 gap-2">
		{#each breakdown as entry, i (entry.dieType)}
			{@const luckScore = luck(entry)}
			<div
				class="rounded-2xl bg-stone-800 px-4 py-3"
				style="opacity: {visible ? 1 : 0}; transform: translateY({visible
					? 0
					: 16}px); transition: opacity 0.35s ease-out, transform 0.35s ease-out; transition-delay: {i *
					80}ms;"
			>
				<div class="mb-2 flex items-center justify-between">
					<DieIcon dieType={entry.dieType} size={48} />
					<div class="flex items-center gap-3 text-xs text-stone-400">
						<span>{entry.count} {entry.count === 1 ? 'roll' : 'rolls'}</span>
						<span
							class={['font-semibold', luckClass(luckScore)]}
							title="luck vs expected {theoreticalAvg(entry.dieType)}">{fmtLuck(luckScore)}</span
						>
					</div>
				</div>
				<div class="relative h-6 rounded-full bg-stone-700">
					<div class="absolute inset-0 overflow-hidden rounded-full">
						<div
							class="h-full rounded-full"
							style="width: {visible ? (entry.avg / entry.dieType) * 100 : 0}%; background: {color(
								entry.dieType
							)}; opacity: 0.7; transition: width 0.7s cubic-bezier(0.33, 1, 0.68, 1); transition-delay: {i *
								80 +
								250}ms;"
						></div>
					</div>
					<div class="absolute inset-0 flex items-center justify-center">
						<span class="text-xs font-bold text-white drop-shadow">avg {entry.avg}</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

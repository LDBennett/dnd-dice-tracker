<script lang="ts">
	import { DIE_SHAPE, DIE_TEXT_Y } from '@fe-shared/ui';

	let { dieType, value }: { dieType: number; value: number } = $props();

	const ARC_R = 52;
	const ARC_C = +(2 * Math.PI * ARC_R).toFixed(2);

	function arcReveal(node: SVGCircleElement, targetOffset: number) {
		node.style.strokeDashoffset = String(ARC_C);
		requestAnimationFrame(() => {
			node.style.transition = 'stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1)';
			node.style.strokeDashoffset = String(targetOffset);
		});
		return {
			update(newOffset: number) {
				node.style.strokeDashoffset = String(newOffset);
			}
		};
	}
</script>

<svg viewBox="-8 -8 116 116" width="46" height="46">
	<circle cx="50" cy="50" r={ARC_R} fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="5" />
	<circle
		cx="50"
		cy="50"
		r={ARC_R}
		fill="none"
		stroke="rgba(0,0,0,0.45)"
		stroke-width="5"
		stroke-linecap="round"
		stroke-dasharray={ARC_C}
		transform="rotate(-90 50 50)"
		use:arcReveal={ARC_C * (1 - value / dieType)}
	/>
	{#if DIE_SHAPE[dieType]}
		<polygon
			points={DIE_SHAPE[dieType]!}
			fill="rgba(0,0,0,0.22)"
			stroke="rgba(0,0,0,0.45)"
			stroke-width="4"
			stroke-linejoin="round"
		/>
	{:else}
		<circle
			cx="50"
			cy="50"
			r="44"
			fill="rgba(0,0,0,0.22)"
			stroke="rgba(0,0,0,0.45)"
			stroke-width="4"
		/>
	{/if}
	<text
		x="50"
		y={DIE_TEXT_Y[dieType]}
		text-anchor="middle"
		dominant-baseline="middle"
		fill="rgba(0,0,0,0.72)"
		font-size={dieType === 100 ? 14 : 16}
		font-weight="800"
		font-family="system-ui, sans-serif">d{dieType}</text
	>
</svg>
<div class="flex items-center gap-0.5 text-sm leading-none font-black text-stone-900">
	<span class="mdi mdi-arrow-right-bold text-xs"></span>
	{value}
</div>

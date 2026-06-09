<script lang="ts">
	import { DIE_COLOR, DIE_SHAPE, DIE_TEXT_Y } from '../static/dice-colors';

	let { dieType, size = 38 }: { dieType: number; size?: number } = $props();

	const col = $derived(DIE_COLOR[dieType] ?? '#94a3b8');
	const shape = $derived(DIE_SHAPE[dieType]);
	const textY = $derived(DIE_TEXT_Y[dieType] ?? 50);
</script>

<svg viewBox="0 0 100 100" width={size} height={size} aria-label="d{dieType}">
	{#if shape}
		<polygon points={shape} fill="{col}33" stroke={col} stroke-width="5" stroke-linejoin="round" />
	{:else}
		<circle cx="50" cy="50" r="44" fill="{col}33" stroke={col} stroke-width="5" />
	{/if}
	<text
		x="50"
		y={textY}
		text-anchor="middle"
		dominant-baseline="middle"
		fill={col}
		font-size={dieType === 100 ? 14 : 18}
		font-weight="800"
		font-family="system-ui, sans-serif">d{dieType}</text
	>
</svg>

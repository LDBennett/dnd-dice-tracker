<script lang="ts">
	import { DIE_COLOR, DIE_SHAPE, DIE_TEXT_Y } from '@fe-shared/ui';
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	let { dice }: { dice: number[] } = $props();
</script>

{#each dice as die, i (die)}
	<svg
		in:scale={{ duration: 350, delay: i * 100, start: 0.3, easing: backOut }}
		viewBox="0 0 100 100"
		width="38"
		height="38"
	>
		{#if DIE_SHAPE[die]}
			<polygon
				points={DIE_SHAPE[die]!}
				fill="{DIE_COLOR[die]}33"
				stroke={DIE_COLOR[die]}
				stroke-width="5"
				stroke-linejoin="round"
			/>
		{:else}
			<circle cx="50" cy="50" r="44" fill="{DIE_COLOR[die]}33" stroke={DIE_COLOR[die]} stroke-width="5" />
		{/if}
		<text
			x="50"
			y={DIE_TEXT_Y[die]}
			text-anchor="middle"
			dominant-baseline="middle"
			fill={DIE_COLOR[die]}
			font-size={die === 100 ? 14 : 18}
			font-weight="800"
			font-family="system-ui, sans-serif"
		>d{die}</text>
	</svg>
{/each}

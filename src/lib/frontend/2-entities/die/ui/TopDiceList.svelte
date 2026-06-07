<script lang="ts">
	import { DieIcon } from '@fe-shared/ui';
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	let { dice }: { dice: number[] } = $props();
</script>

{#each dice as die, i (die)}
	<span
		class="inline-flex"
		in:scale={{ duration: 350, delay: i * 100, start: 0.3, easing: backOut }}
	>
		<DieIcon dieType={die} size={38} />
	</span>
{/each}

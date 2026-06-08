<script lang="ts">
	import logoMarkup from '$lib/assets/logo.svg?raw';

	let { class: className = '', style = '' }: { class?: string; style?: string } = $props();
</script>

<span class={['logo block [&>svg]:w-full [&>svg]:h-full', className]} {style}>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html logoMarkup}
</span>

<style>
	.logo :global(svg *) {
		fill: var(--logo-fill, var(--accent));
	}
</style>

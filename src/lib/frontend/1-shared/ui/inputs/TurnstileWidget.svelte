<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';

	interface Props {
		onToken: (token: string) => void;
	}

	let { onToken }: Props = $props();

	let container: HTMLDivElement | undefined = $state();
	let widgetId: string | undefined;
	let poll: ReturnType<typeof setInterval>;

	onMount(() => {
		poll = setInterval(() => {
			if (window.turnstile && container) {
				clearInterval(poll);
				widgetId = window.turnstile.render(container, {
					sitekey: PUBLIC_TURNSTILE_SITE_KEY,
					callback: onToken,
					theme: 'dark'
				});
			}
		}, 50);
	});

	onDestroy(() => {
		clearInterval(poll);
		if (widgetId !== undefined) window.turnstile?.remove(widgetId);
	});
</script>

<div bind:this={container}></div>

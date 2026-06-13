<script lang="ts">
	import './layout.css';

	import favicon from '$lib/assets/favicon.svg';
	import ogImage from '$lib/assets/logo-full.png';
	import { AnalyticsConsent } from '@fe-shared/ui';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&display=swap"
		rel="stylesheet"
	/>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#0f172a" />
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
	<title>Tabula Rollsa</title>
	<meta
		name="description"
		content="A fresh slate for every session. Tabula Rollsa tracks your D&D dice rolls, nat 20s, nat 1s, and roll history — built for players who like knowing their numbers."
	/>
	<meta property="og:title" content="Tabula Rollsa" />
	<meta
		property="og:description"
		content="A fresh slate for every session. Tabula Rollsa tracks your D&D dice rolls, nat 20s, nat 1s, and roll history — built for players who like knowing their numbers."
	/>
	<meta property="og:image" content={ogImage} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://tabularollsa.com" />
</svelte:head>

<AnalyticsConsent />
{@render children()}

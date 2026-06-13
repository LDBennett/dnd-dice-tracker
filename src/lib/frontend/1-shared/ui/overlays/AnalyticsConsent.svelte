<script lang="ts">
	import { onMount } from 'svelte';

	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { dev } from '$app/environment';
	import { PUBLIC_GA_MEASUREMENT_ID } from '$env/static/public';

	import Button from '../buttons/Button.svelte';

	const CONSENT_KEY = 'ga-consent';

	let consentStatus = $state<'pending' | 'granted' | 'declined'>('pending');

	function initAnalytics() {
		injectAnalytics({ mode: dev ? 'development' : 'production' });

		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA_MEASUREMENT_ID}`;
		script.onload = () => {
			window.dataLayer ??= [];
			window.gtag = function (...args: unknown[]) {
				window.dataLayer!.push(args);
			};
			window.gtag('js', new Date());
			window.gtag('config', PUBLIC_GA_MEASUREMENT_ID);
		};
		document.head.appendChild(script);
	}

	function handleAccept() {
		localStorage.setItem(CONSENT_KEY, 'granted');
		consentStatus = 'granted';
		initAnalytics();
	}

	function handleDecline() {
		localStorage.setItem(CONSENT_KEY, 'declined');
		consentStatus = 'declined';
	}

	onMount(() => {
		const stored = localStorage.getItem(CONSENT_KEY) as 'granted' | 'declined' | null;
		if (stored) {
			consentStatus = stored;
			if (stored === 'granted') initAnalytics();
		}
	});
</script>

{#if consentStatus === 'pending'}
	<div
		class="fixed bottom-0 left-0 right-0 z-100 border-t border-stone-700 bg-stone-900 px-4 py-4"
		style="padding-bottom: max(1rem, env(safe-area-inset-bottom))"
		role="dialog"
		aria-label="Cookie consent"
	>
		<div class="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-sm text-stone-400">
				We use analytics to understand how the app is used and improve it. No personal data is sold.
			</p>
			<div class="flex shrink-0 gap-2">
				<Button onclick={handleDecline}>Decline</Button>
				<Button variant="primary" class="px-5 py-2 text-sm" onclick={handleAccept}>Accept</Button>
			</div>
		</div>
	</div>
{/if}

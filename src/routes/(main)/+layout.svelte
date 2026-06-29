<script lang="ts">
	import { Session } from '@fe-entities/session';
	import { LoginModal } from '@fe-features/authenticate';
	import { HandednessToggle } from '@fe-features/handedness';
	import { ThemePicker } from '@fe-features/pick-theme';
	import { persist } from '@fe-shared';
	import { APP_CONTEXT_KEY, AppContext } from '@fe-shared/context';
	import { BottomNav } from '@fe-widgets/bottom-nav';
	import { NavBar } from '@fe-widgets/top-nav';
	import { setContext, untrack } from 'svelte';

	import { browser } from '$app/environment';

	import type { LayoutServerData } from './$types';

	let { data, children }: { data: LayoutServerData; children: import('svelte').Snippet } = $props();

	const session = new Session();
	const app = new AppContext({
		user: untrack(() => data.user),
		rollMode: browser ? localStorage.getItem('rollMode') === 'quick' : false,
		rightHanded: browser ? localStorage.getItem('handedness') === 'right' : false,
		session
	});
	setContext(APP_CONTEXT_KEY, app);
	$effect(() => {
		app.user = data.user;
	});
	$effect(() => {
		session.guestMode = app.isGuest;
	});
	if (browser) {
		app.session.currentSessionId = localStorage.getItem('currentSessionId');
		app.session.rolledAt = localStorage.getItem('sessionRolledAt');
		app.session.currentSessionName = localStorage.getItem('sessionName') ?? '';
		app.theme = localStorage.getItem('theme') ?? 'default';
		if (!untrack(() => data.user)) {
			const saved = localStorage.getItem('guestSessionRolls');
			if (saved) {
				try {
					session.currentSessionRolls = JSON.parse(saved);
				} catch (e) {
					// Ignore malformed saved guest rolls
					console.warn('Failed to parse guestSessionRolls from localStorage', e);
				}
			}
		}
	}

	$effect(() => {
		persist('rollMode', app.rollMode ? 'quick' : 'log');
	});
	$effect(() => {
		persist('handedness', app.rightHanded ? 'right' : 'left');
	});
	$effect(() => {
		persist('currentSessionId', app.session.currentSessionId);
	});
	$effect(() => {
		persist('sessionRolledAt', app.session.rolledAt);
	});
	$effect(() => {
		persist('sessionName', app.session.currentSessionName || null);
	});
	$effect(() => {
		persist('theme', app.theme);
	});
	$effect(() => {
		if (app.isGuest && app.session.currentSessionRolls.length > 0)
			persist('guestSessionRolls', JSON.stringify(app.session.currentSessionRolls));
		else localStorage.removeItem('guestSessionRolls');
	});
	$effect(() => {
		document.documentElement.dataset.theme = app.theme;
	});
</script>

<div class="min-h-screen bg-stone-900 text-white">
	<NavBar />

	<main
		class="mx-auto max-w-225 pt-14"
		style="padding-bottom: calc(10rem + env(safe-area-inset-bottom))"
	>
		{@render children()}
	</main>

	<BottomNav />
	<HandednessToggle />
</div>

<LoginModal bind:open={app.showLogin} />
<ThemePicker bind:open={app.showThemePicker} />

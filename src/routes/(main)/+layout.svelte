<script lang="ts">
	import { Session } from '@fe-entities/session';
	import { LoginModal } from '@fe-features/authenticate';
	import { ThemePickerModal } from '@fe-features/pick-theme';
	import { HandednessToggle } from '@fe-features/toggle-handedness';
	import { APP_CONTEXT_KEY,AppContext } from '@fe-shared/context';
	import { BottomNav } from '@fe-widgets/bottom-nav';
	import { NavBar } from '@fe-widgets/nav-bar';
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
		localStorage.setItem('rollMode', app.rollMode ? 'quick' : 'log');
	});
	$effect(() => {
		localStorage.setItem('handedness', app.rightHanded ? 'right' : 'left');
	});
	$effect(() => {
		if (app.session.currentSessionId)
			localStorage.setItem('currentSessionId', app.session.currentSessionId);
		else localStorage.removeItem('currentSessionId');
	});
	$effect(() => {
		if (app.session.rolledAt) localStorage.setItem('sessionRolledAt', app.session.rolledAt);
		else localStorage.removeItem('sessionRolledAt');
	});
	$effect(() => {
		if (app.session.currentSessionName)
			localStorage.setItem('sessionName', app.session.currentSessionName);
		else localStorage.removeItem('sessionName');
	});
	$effect(() => {
		if (app.isGuest) {
			if (app.session.currentSessionRolls.length > 0)
				localStorage.setItem('guestSessionRolls', JSON.stringify(app.session.currentSessionRolls));
			else localStorage.removeItem('guestSessionRolls');
		} else {
			localStorage.removeItem('guestSessionRolls');
		}
	});
	$effect(() => {
		localStorage.setItem('theme', app.theme);
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
<ThemePickerModal bind:open={app.showThemePicker} />

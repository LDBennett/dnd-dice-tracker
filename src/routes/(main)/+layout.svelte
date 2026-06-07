<script lang="ts">
	import { browser } from '$app/environment';
	import { setContext, untrack } from 'svelte';
	import type { LayoutServerData } from './$types';
	import { NavBar } from '@fe-widgets/nav-bar';
	import { BottomNav } from '@fe-widgets/bottom-nav';
	import { LoginModal } from '@fe-features/authenticate';
	import { ThemePickerModal } from '@fe-features/pick-theme';
	import { HandednessToggle } from '@fe-features/toggle-handedness';
	import { AppContext, APP_CONTEXT_KEY } from '@fe-shared/context';
	import { Session } from '@fe-entities/session';

	let { data, children }: { data: LayoutServerData; children: import('svelte').Snippet } = $props();

	const app = new AppContext({
		user: untrack(() => data.user),
		rollMode: browser ? localStorage.getItem('rollMode') === 'quick' : false,
		rightHanded: browser ? localStorage.getItem('handedness') === 'right' : false,
		session: new Session()
	});
	setContext(APP_CONTEXT_KEY, app);
	$effect(() => {
		app.user = data.user;
	});
	if (browser) {
		app.session.currentSessionId = localStorage.getItem('currentSessionId');
		app.session.rolledAt = localStorage.getItem('sessionRolledAt');
		app.theme = localStorage.getItem('theme') ?? 'default';
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
		localStorage.setItem('theme', app.theme);
	});
</script>

<div class="min-h-screen bg-stone-900 text-white" data-theme={app.theme}>
	<NavBar />

	<main
		class="mx-auto max-w-225 pt-14"
		style="padding-bottom: calc(10rem + env(safe-area-inset-bottom))"
	>
		{@render children()}
	</main>

	<BottomNav />
</div>

<HandednessToggle />

<LoginModal bind:open={app.showLogin} />
<ThemePickerModal bind:open={app.showThemePicker} />

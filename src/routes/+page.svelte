<script lang="ts">
	import { browser } from '$app/environment';
	import type { PageServerData } from './$types';
	import { NavBar, LoginModal, HandednessToggle } from '$lib/frontend/shared/ui';
	import { DiceLogger } from '$lib/frontend/widgets/dice-dashboard';
	import { StatsDashboard } from '$lib/frontend/widgets/stats-dashboard';
	import { HistoryEditor } from '$lib/frontend/widgets/history-editor';

	let { data }: { data: PageServerData } = $props();

	type Tab = 'roll' | 'stats' | 'history';
	let activeTab   = $state<Tab>('roll');
	let rightHanded = $state(browser ? localStorage.getItem('handedness') === 'right' : false);
	let rollMode    = $state(browser ? localStorage.getItem('rollMode') === 'quick' : false);
	let showLogin   = $state(false);

	$effect(() => {
		localStorage.setItem('handedness', rightHanded ? 'right' : 'left');
	});

	$effect(() => {
		localStorage.setItem('rollMode', rollMode ? 'quick' : 'log');
	});

	let { totalRolls, averageValue, nat20s, nat1s } = $derived(data.dashboard);

	const isGuest = $derived(!data.user);
	function openLogin() { showLogin = true; }
</script>

<div class="min-h-screen bg-slate-900 text-white">
	<NavBar bind:activeTab bind:rollMode user={data.user} onSignInClick={openLogin} />

	<main class="mx-auto max-w-225 pt-26" style="padding-bottom: max(5rem, env(safe-area-inset-bottom))">
		{#if activeTab === 'roll'}
			<DiceLogger {rightHanded} {isGuest} {rollMode} onSignInClick={openLogin} />
		{:else if activeTab === 'stats'}
			<StatsDashboard {totalRolls} {nat20s} {nat1s} {isGuest} />
		{:else}
			<HistoryEditor {isGuest} />
		{/if}
	</main>
</div>

<!-- Floating handedness toggle (logged-in only) -->
{#if data.user}
	<HandednessToggle {rightHanded} onToggle={() => (rightHanded = !rightHanded)} />
{/if}

<LoginModal bind:open={showLogin} />

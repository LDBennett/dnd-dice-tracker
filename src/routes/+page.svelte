<script lang="ts">
	import { browser } from '$app/environment';
	import type { PageServerData } from './$types';
	import NavBar from '$lib/components/ui/NavBar.svelte';
	import LoginModal from '$lib/components/ui/LoginModal.svelte';
	import DiceLogger from '$lib/components/dice/DiceLogger.svelte';
	import StatsDashboard from '$lib/components/stats/StatsDashboard.svelte';
	import HistoryEditor from '$lib/components/history/HistoryEditor.svelte';

	let { data }: { data: PageServerData } = $props();

	type Tab = 'roll' | 'stats' | 'history';
	let activeTab   = $state<Tab>('roll');
	let rightHanded = $state(browser ? localStorage.getItem('handedness') === 'right' : false);
	let showLogin   = $state(false);

	$effect(() => {
		localStorage.setItem('handedness', rightHanded ? 'right' : 'left');
	});

	let { totalRolls, averageValue, nat20s, nat1s } = $derived(data.dashboard);

	const isGuest = $derived(!data.user);
	function openLogin() { showLogin = true; }
</script>

<div class="min-h-screen bg-slate-900 text-white">
	<NavBar bind:activeTab user={data.user} onSignInClick={openLogin} />

	<main class="mx-auto max-w-225 pt-26" style="padding-bottom: max(5rem, env(safe-area-inset-bottom))">
		{#if activeTab === 'roll'}
			<DiceLogger {rightHanded} {isGuest} onSignInClick={openLogin} />
		{:else if activeTab === 'stats'}
			<StatsDashboard {totalRolls} {averageValue} {nat20s} {nat1s} {isGuest} />
		{:else}
			<HistoryEditor {isGuest} />
		{/if}
	</main>
</div>

<!-- Floating handedness toggle (logged-in only) -->
{#if data.user}
	<button
		type="button"
		onclick={() => (rightHanded = !rightHanded)}
		title="Switch handedness"
		class="fixed z-40 flex h-13 w-13 items-center justify-center rounded-full bg-slate-800 text-xl shadow-lg ring-1 ring-slate-700 transition hover:bg-slate-700 active:scale-90"
		style="bottom: max(1.5rem, env(safe-area-inset-bottom)); {rightHanded ? 'left: 1.5rem' : 'right: 1.5rem'}"
	>{rightHanded ? '🤚' : '✋'}</button>
{/if}

<LoginModal bind:open={showLogin} />

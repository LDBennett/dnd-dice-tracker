<script lang="ts">
	import { browser } from '$app/environment';
	import type { PageServerData } from './$types';
	import NavBar from '$lib/components/NavBar.svelte';
	import DiceLogger from '$lib/components/DiceLogger.svelte';
	import StatsDashboard from '$lib/components/StatsDashboard.svelte';
	import HistoryEditor from '$lib/components/HistoryEditor.svelte';
	import LoginModal from '$lib/components/LoginModal.svelte';

	let { data }: { data: PageServerData } = $props();

	type Tab = 'roll' | 'stats' | 'history';
	let activeTab = $state<Tab>('roll');
	let rightHanded = $state(browser ? localStorage.getItem('handedness') === 'right' : false);
	let showLogin = $state(false);

	$effect(() => {
		localStorage.setItem('handedness', rightHanded ? 'right' : 'left');
	});

	let { totalRolls, averageValue, nat20s, nat1s } = $derived(data.dashboard);

	const isGuest = $derived(!data.user);
	function openLogin() {
		showLogin = true;
	}
</script>

<div class="min-h-screen bg-slate-900 text-white">
	<NavBar bind:activeTab bind:rightHanded user={data.user} onSignInClick={openLogin} />

	<main class="pt-26">
		{#if activeTab === 'roll'}
			<DiceLogger {rightHanded} {isGuest} onSignInClick={openLogin} />
		{:else if activeTab === 'stats'}
			<StatsDashboard {totalRolls} {averageValue} {nat20s} {nat1s} {isGuest} />
		{:else}
			<HistoryEditor {isGuest} />
		{/if}
	</main>
</div>

<LoginModal bind:open={showLogin} />

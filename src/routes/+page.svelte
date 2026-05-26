<script lang="ts">
	import type { PageServerData } from './$types';
	import NavBar from '$lib/components/NavBar.svelte';
	import DiceLogger from '$lib/components/DiceLogger.svelte';
	import StatsDashboard from '$lib/components/StatsDashboard.svelte';
	import HistoryEditor from '$lib/components/HistoryEditor.svelte';

	let { data }: { data: PageServerData } = $props();

	type Tab = 'roll' | 'stats' | 'history';
	let activeTab = $state<Tab>('roll');

	let { totalRolls, averageValue, nat20s, nat1s } = $derived(data.dashboard);
</script>

<div class="min-h-screen bg-slate-900 text-white">
	<NavBar bind:activeTab />

	<main class="pt-26">
		{#if activeTab === 'roll'}
			<DiceLogger />
		{:else if activeTab === 'stats'}
			<StatsDashboard {totalRolls} {averageValue} {nat20s} {nat1s} />
		{:else}
			<HistoryEditor />
		{/if}
	</main>
</div>

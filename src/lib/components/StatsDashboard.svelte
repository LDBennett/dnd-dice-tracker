<script lang="ts">
	interface Props {
		totalRolls: number;
		averageValue: number;
		nat20s: number;
		nat1s: number;
	}

	let { totalRolls, averageValue, nat20s, nat1s }: Props = $props();

	async function refresh() {
		const res = await fetch('/api/dashboard');
		if (res.ok) {
			const data = await res.json();
			totalRolls = data.totalRolls;
			averageValue = data.averageValue;
			nat20s = data.nat20s;
			nat1s = data.nat1s;
		}
	}
</script>

<div class="px-4 py-6">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-xl font-bold text-white">Your Stats</h2>
		<button
			type="button"
			onclick={refresh}
			class="rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
			aria-label="Refresh stats"
		>
			↻ Refresh
		</button>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div class="flex flex-col rounded-2xl bg-slate-800 p-5">
			<span class="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">Total Rolls</span>
			<span class="text-4xl font-extrabold text-white">{totalRolls}</span>
		</div>

		<div class="flex flex-col rounded-2xl bg-slate-800 p-5">
			<span class="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">Average Roll</span>
			<span class="text-4xl font-extrabold text-amber-400">{averageValue}</span>
		</div>

		<div class="flex flex-col rounded-2xl bg-amber-400/10 p-5 ring-1 ring-amber-400/30">
			<span class="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-500">Nat 20s</span>
			<span class="text-4xl font-extrabold text-amber-400">{nat20s}</span>
			<span class="mt-1 text-xs text-slate-500">d20 critical hits</span>
		</div>

		<div class="flex flex-col rounded-2xl bg-red-900/20 p-5 ring-1 ring-red-800/40">
			<span class="mb-1 text-xs font-semibold uppercase tracking-widest text-red-500">Nat 1s</span>
			<span class="text-4xl font-extrabold text-red-400">{nat1s}</span>
			<span class="mt-1 text-xs text-slate-500">d20 critical fails</span>
		</div>
	</div>

	{#if totalRolls === 0}
		<div class="mt-8 text-center text-slate-500">
			<p class="text-4xl mb-2">🎲</p>
			<p>No rolls logged yet.</p>
			<p class="text-sm">Go roll some dice!</p>
		</div>
	{:else if nat20s > 0 || nat1s > 0}
		<div class="mt-6 rounded-2xl bg-slate-800 p-4 text-sm text-slate-400">
			{#if nat20s > 0 && nat1s > 0}
				<p>You've rolled {nat20s} natural 20{nat20s !== 1 ? 's' : ''} and {nat1s} natural 1{nat1s !== 1 ? 's' : ''}.</p>
			{:else if nat20s > 0}
				<p>You've rolled {nat20s} natural 20{nat20s !== 1 ? 's' : ''}! Fortune favors you.</p>
			{:else}
				<p>You've rolled {nat1s} natural 1{nat1s !== 1 ? 's' : ''}. The dice are fickle.</p>
			{/if}
		</div>
	{/if}
</div>

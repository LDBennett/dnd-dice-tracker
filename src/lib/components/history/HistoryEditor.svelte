<script lang="ts">
	import SessionCard from './SessionCard.svelte';

	interface RollRecord { dieType: number; value: number; note: string; }
	interface Session {
		id: string;
		rolls: RollRecord[];
		modifier: number;
		rolledAt: string;
		name: string;
		total: number;
	}

	let { isGuest = false }: { isGuest?: boolean } = $props();

	let sessions  = $state<Session[]>([]);
	let loading   = $state(true);
	let savingId  = $state<string | null>(null);
	let savedId   = $state<string | null>(null);

	$effect(() => { fetchSessions(); });

	async function fetchSessions() {
		loading = true;
		try {
			const res = await fetch('/api/rolls');
			if (res.ok) sessions = await res.json();
		} finally {
			loading = false;
		}
	}

	async function saveName(id: string, name: string) {
		await patch(id, { name });
	}

	async function saveRolls(id: string, rolls: RollRecord[]) {
		await patch(id, { rolls });
	}

	async function patch(id: string, body: object) {
		savingId = id;
		try {
			await fetch(`/api/rolls/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			savedId = id;
			setTimeout(() => { if (savedId === id) savedId = null; }, 1800);
		} finally {
			savingId = null;
		}
	}
</script>

<div class="px-4 py-6">
	<div class="mb-5 flex items-center justify-between">
		<h2 class="text-xl font-bold text-white">{isGuest ? "Lee's" : 'Your'} Roll History</h2>
		<button
			type="button"
			onclick={fetchSessions}
			class="rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
		>↻ Refresh</button>
	</div>

	{#if loading}
		<div class="py-16 text-center text-slate-500">Loading…</div>
	{:else if sessions.length === 0}
		<div class="py-16 text-center text-slate-500">
			<p class="mb-2 text-4xl">📜</p>
			<p>No sessions yet. Go roll some dice!</p>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each sessions as session (session.id)}
				<SessionCard
					{session}
					{isGuest}
					{savingId}
					{savedId}
					onSaveName={saveName}
					onSaveRolls={saveRolls}
				/>
			{/each}
		</div>
	{/if}
</div>

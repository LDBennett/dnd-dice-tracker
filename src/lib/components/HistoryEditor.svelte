<script lang="ts">
	import { fade } from 'svelte/transition';

	let { isGuest = false }: { isGuest?: boolean } = $props();

	interface RollRecord {
		dieType: number;
		value: number;
		note: string;
	}

	interface Session {
		id: string;
		rolls: RollRecord[];
		modifier: number;
		rolledAt: string;
		name: string;
		total: number;
	}

	let sessions = $state<Session[]>([]);
	let loading = $state(true);
	let savingId = $state<string | null>(null);
	let savedId = $state<string | null>(null);
	// Local editable copies — keyed by session id
	let names = $state<Record<string, string>>({});
	let rolls = $state<Record<string, RollRecord[]>>({});

	$effect(() => {
		fetchSessions();
	});

	async function fetchSessions() {
		loading = true;
		try {
			const res = await fetch('/api/rolls');
			if (res.ok) {
				sessions = await res.json();
				names = Object.fromEntries(sessions.map((s) => [s.id, s.name]));
				rolls = Object.fromEntries(sessions.map((s) => [s.id, s.rolls.map((r) => ({ ...r }))]));
			}
		} finally {
			loading = false;
		}
	}

	async function saveName(id: string) {
		await patch(id, { name: names[id] ?? '' });
	}

	async function saveRolls(id: string) {
		await patch(id, { rolls: rolls[id] });
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
			setTimeout(() => {
				if (savedId === id) savedId = null;
			}, 1800);
		} finally {
			savingId = null;
		}
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatTime(iso: string) {
		return new Date(iso).toLocaleTimeString(undefined, {
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	const DIE_COLOR: Record<number, string> = {
		4: '#f87171',
		6: '#fb923c',
		8: '#facc15',
		10: '#4ade80',
		12: '#2dd4bf',
		20: '#fbbf24',
		100: '#c084fc'
	};
	function dieColor(t: number) {
		return DIE_COLOR[t] ?? '#94a3b8';
	}
</script>

<div class="px-4 py-6">
	<div class="mb-5 flex items-center justify-between">
		<h2 class="text-xl font-bold text-white">{isGuest ? "Lee's" : 'Your'} Roll History</h2>
		<button
			type="button"
			onclick={fetchSessions}
			class="rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
			>↻ Refresh</button
		>
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
				<div class="rounded-2xl bg-slate-800 p-4">
					<!-- Session name -->
					<div class="relative mb-3">
						{#if isGuest}
							<p class="px-3 py-2 text-sm font-semibold text-white">
								{names[session.id] || 'Unnamed session'}
							</p>
						{:else}
							<input
								type="text"
								bind:value={names[session.id]}
								onblur={() => saveName(session.id)}
								placeholder="Unnamed session"
								class="w-full rounded-xl border border-slate-600 bg-slate-700/60 px-3 py-2 text-sm font-semibold text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 focus:outline-none"
							/>
						{/if}
					</div>

					<!-- Date + total -->
					<div class="mb-3 flex items-center justify-between">
						<div>
							<p class="text-xs font-semibold text-slate-400">{formatDate(session.rolledAt)}</p>
							<p class="text-xs text-slate-500">{formatTime(session.rolledAt)}</p>
						</div>
						<div class="text-right">
							<p class="text-xs text-slate-500">Total Rolls</p>
							<p class="text-lg font-black text-amber-400">{session.rolls.length}</p>
						</div>
					</div>

					<!-- Per-roll editors -->
					<div class="flex flex-col gap-2">
						{#each rolls[session.id] ?? [] as roll, i (i)}
							<div class="flex items-center gap-2">
								<!-- Die chip -->
								<span
									class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-slate-900"
									style="background: {dieColor(roll.dieType)}">d{roll.dieType}→{roll.value}</span
								>
								<!-- Note -->
								{#if isGuest}
									{#if roll.note}
										<span class="min-w-0 flex-1 text-xs leading-5 text-slate-400">{roll.note}</span>
									{/if}
								{:else}
									<input
										type="text"
										bind:value={rolls[session.id][i].note}
										onblur={() => saveRolls(session.id)}
										placeholder="Note…"
										class="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-700/60 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 focus:outline-none"
									/>
								{/if}
							</div>
						{/each}
						{#if session.modifier !== 0}
							<span
								class="self-start rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-400"
							>
								modifier {session.modifier >= 0 ? `+${session.modifier}` : session.modifier}
							</span>
						{/if}
					</div>

					<!-- Save indicator -->
					{#if !isGuest && savingId === session.id}
						<p class="mt-2 text-right text-xs text-slate-500">Saving…</p>
					{:else if !isGuest && savedId === session.id}
						<p
							in:fade={{ duration: 150 }}
							out:fade={{ duration: 400 }}
							class="mt-2 text-right text-xs font-semibold text-amber-400"
						>
							✓ Saved
						</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<script lang="ts">
	import StatCard from './StatCard.svelte';
	import DieBreakdown from './DieBreakdown.svelte';

	interface RollRecord { dieType: number; value: number; }
	interface SessionRecord { id: string; name: string; rolledAt: string; rolls: RollRecord[]; }
	interface DieStat { count: number; sum: number; }
	interface BreakdownEntry { dieType: number; count: number; avg: number; }
	interface SessionLuck { id: string; name: string; rolledAt: string; luck: number; }

	interface Props {
		totalRolls: number;
		nat20s: number;
		nat1s: number;
		isGuest: boolean;
	}

	let { totalRolls, nat20s, nat1s, isGuest }: Props = $props();

	let sessionCount      = $state(0);
	let favDie            = $state<number | null>(null);
	let breakdown         = $state<BreakdownEntry[]>([]);
	let sessionLucks      = $state<SessionLuck[]>([]);
	let avgLuckPerSession = $state(0);
	let luckExpanded      = $state(false);

	const DIE_COLOR: Record<number, string> = {
		4: '#f87171', 6: '#fb923c', 8: '#facc15',
		10: '#4ade80', 12: '#2dd4bf', 20: '#fbbf24', 100: '#c084fc'
	};

	function computeExtended(sessions: SessionRecord[]) {
		// Die breakdown
		const counts: Partial<Record<number, DieStat>> = {};
		for (const s of sessions) {
			for (const r of s.rolls) {
				const d = counts[r.dieType] ?? { count: 0, sum: 0 };
				counts[r.dieType] = { count: d.count + 1, sum: d.sum + r.value };
			}
		}
		const entries: BreakdownEntry[] = Object.entries(counts)
			.map(([dt, st]) => ({
				dieType: Number(dt),
				count:   st!.count,
				avg:     Number((st!.sum / st!.count).toFixed(2))
			}))
			.sort((a, b) => a.dieType - b.dieType);

		const fav = entries.reduce<BreakdownEntry | null>(
			(best, e) => (!best || e.count > best.count ? e : best),
			null
		);

		// Session luck: avg(actual - expected) per roll, per session
		const lucks: SessionLuck[] = sessions
			.filter((s) => s.rolls.length > 0)
			.map((s) => {
				const total = s.rolls.reduce((acc, r) => acc + r.value - (r.dieType + 1) / 2, 0);
				return { id: s.id, name: s.name, rolledAt: s.rolledAt, luck: Number((total / s.rolls.length).toFixed(2)) };
			});

		const avgLuck = lucks.length > 0
			? Number((lucks.reduce((s, l) => s + l.luck, 0) / lucks.length).toFixed(2))
			: 0;

		sessionCount      = sessions.length;
		favDie            = fav?.dieType ?? null;
		breakdown         = entries;
		sessionLucks      = lucks;
		avgLuckPerSession = avgLuck;
	}

	async function loadExtended() {
		const res = await fetch('/api/rolls');
		if (res.ok) computeExtended(await res.json());
	}

	$effect(() => { loadExtended(); });

	async function refresh() {
		const [dashRes, rollsRes] = await Promise.all([fetch('/api/dashboard'), fetch('/api/rolls')]);
		if (dashRes.ok) {
			const data = await dashRes.json();
			totalRolls = data.totalRolls;
			nat20s     = data.nat20s;
			nat1s      = data.nat1s;
		}
		if (rollsRes.ok) computeExtended(await rollsRes.json());
	}

	function fmtLuck(n: number) { return (n >= 0 ? '+' : '') + n.toFixed(2); }
	function luckClass(n: number) { return n > 0.1 ? 'text-green-400' : n < -0.1 ? 'text-red-400' : 'text-slate-500'; }

	function fmtDate(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}
</script>

<div class="px-4 py-6">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-xl font-bold text-white">{isGuest ? "Lee's" : ''} Stats</h2>
		<button
			type="button"
			onclick={refresh}
			class="rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
			aria-label="Refresh stats"
		>↻ Refresh</button>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<StatCard label="Total Rolls" value={totalRolls} />
		<StatCard
			label="Favourite Die"
			value={favDie !== null ? `d${favDie}` : '—'}
			valueColor={favDie !== null ? (DIE_COLOR[favDie] ?? '#94a3b8') : '#475569'}
		/>
		<StatCard label="Nat 20s" value={nat20s} accent="amber" subtext="d20 critical hits" />
		<StatCard label="Nat 1s"  value={nat1s}  accent="red"   subtext="d20 critical fails" />
		<StatCard label="Sessions" value={sessionCount} />
		<StatCard
			label="Avg Luck/Session"
			value={sessionCount > 0 ? fmtLuck(avgLuckPerSession) : '—'}
			valueColor={sessionCount > 0
				? (avgLuckPerSession > 0.1 ? '#4ade80' : avgLuckPerSession < -0.1 ? '#f87171' : '#94a3b8')
				: '#475569'}
			subtext={luckExpanded ? 'tap to collapse ▲' : 'tap for breakdown ▼'}
			onclick={() => (luckExpanded = !luckExpanded)}
		/>
	</div>

	<!-- Session luck breakdown -->
	{#if luckExpanded && sessionLucks.length > 0}
		<div class="mt-4 rounded-2xl bg-slate-800 p-4">
			<h3 class="mb-2 text-xs font-semibold tracking-widest text-slate-500 uppercase">Luck per Session</h3>
			<p class="mb-4 text-xs leading-relaxed text-slate-500">
				Each session's luck = average <span class="text-slate-400">(actual − expected)</span> per die,
				where expected is the midpoint of that die's range (e.g. d20 → 10.5, d6 → 3.5).
				Positive means you rolled above average; negative means below.
			</p>
			<div class="flex flex-col gap-2">
				{#each sessionLucks as s (s.id)}
					<div class="flex items-center justify-between gap-3">
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-semibold text-white">{s.name || 'Unnamed session'}</p>
							<p class="text-xs text-slate-500">{fmtDate(s.rolledAt)}</p>
						</div>
						<span class="shrink-0 text-sm font-bold {luckClass(s.luck)}">{fmtLuck(s.luck)}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if totalRolls === 0}
		<div class="mt-8 text-center text-slate-500">
			<p class="mb-2 text-4xl">🎲</p>
			<p>No rolls logged yet.</p>
			<p class="text-sm">Go roll some dice!</p>
		</div>
	{:else}
		{#if nat20s > 0 || nat1s > 0}
			<div class="mt-6 flex gap-3">
				{#if nat20s > 0}
					<div class="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-amber-400/10 px-4 py-4 ring-1 ring-amber-400/30">
						<span class="text-2xl">⚔️</span>
						<span class="text-2xl font-black text-amber-400">{nat20s}</span>
						<span class="text-center text-xs font-semibold text-amber-500">Critical Hit{nat20s !== 1 ? 's' : ''}</span>
						<span class="text-center text-xs text-slate-500">Fortune favors you</span>
					</div>
				{/if}
				{#if nat1s > 0}
					<div class="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-red-900/20 px-4 py-4 ring-1 ring-red-800/40">
						<span class="text-2xl">💀</span>
						<span class="text-2xl font-black text-red-400">{nat1s}</span>
						<span class="text-center text-xs font-semibold text-red-500">Critical Fail{nat1s !== 1 ? 's' : ''}</span>
						<span class="text-center text-xs text-slate-500">The dice are fickle</span>
					</div>
				{/if}
			</div>
		{/if}

		{#if breakdown.length > 0}
			<DieBreakdown {breakdown} />
		{/if}
	{/if}
</div>

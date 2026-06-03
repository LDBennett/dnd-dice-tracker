<script lang="ts">
	import { StatCard, DIE_COLOR, Button } from '@fe-shared/ui';
	import { computeExtended, sessionSummary, fmtLuck, luckClass, fmtDate } from '@fe-shared/lib';
	import type { BreakdownEntry, SessionLuck, SessionRecord } from '@fe-shared/lib';
	import { DieBreakdown } from '@fe-entities/die';
	import { getAppContext } from '@fe-shared/context';
	import { fetchRollSessions, fetchDashboard } from '../api/statsDashboard.api';

	interface Props {
		totalRolls: number;
		nat20s: number;
		nat1s: number;
	}

	let { totalRolls, nat20s, nat1s }: Props = $props();

	const app = getAppContext();

	let sessionCount = $state(0);
	let favDie = $state<number | null>(null);
	let breakdown = $state<BreakdownEntry[]>([]);
	let sessionLucks = $state<SessionLuck[]>([]);
	let avgLuckPerSession = $state(0);
	let luckExpanded = $state(false);
	let expandedSessionId = $state<string | null>(null);
	let allSessions = $state<SessionRecord[]>([]);

	function applyExtended(sessions: SessionRecord[]) {
		const ext = computeExtended(sessions);
		sessionCount = ext.sessionCount;
		favDie = ext.favDie;
		breakdown = ext.breakdown;
		sessionLucks = ext.sessionLucks;
		avgLuckPerSession = ext.avgLuckPerSession;
		allSessions = sessions;
	}

	$effect(() => { loadExtended(); });

	async function loadExtended() {
		const sessions = await fetchRollSessions();
		applyExtended(sessions);
	}

	async function refresh() {
		const [dash, sessions] = await Promise.all([fetchDashboard(), fetchRollSessions()]);
		totalRolls = dash.totalRolls;
		nat20s = dash.nat20s;
		nat1s = dash.nat1s;
		applyExtended(sessions);
	}
</script>

<div class="px-4 py-6">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-xl font-bold text-white">{app.isGuest ? "Lee's" : ''} Stats</h2>
		<Button onclick={refresh} aria-label="Refresh stats">↻ Refresh</Button>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<StatCard label="Total Rolls" value={totalRolls} />
		<StatCard
			label="Favourite Die"
			value={favDie !== null ? `d${favDie}` : '—'}
			valueColor={favDie !== null ? (DIE_COLOR[favDie] ?? '#94a3b8') : '#475569'}
		/>
		<StatCard label="Nat 20s" value={nat20s} accent="amber" subtext="d20 critical hits" />
		<StatCard label="Nat 1s" value={nat1s} accent="red" subtext="d20 critical fails" />
		<StatCard label="Sessions" value={sessionCount} />
		<StatCard
			label="Avg Luck/Session"
			value={sessionCount > 0 ? fmtLuck(avgLuckPerSession) : '—'}
			valueColor={sessionCount > 0
				? avgLuckPerSession > 0.1
					? '#4ade80'
					: avgLuckPerSession < -0.1
						? '#f87171'
						: '#94a3b8'
				: '#475569'}
			subtext={luckExpanded ? 'tap to collapse ▲' : 'tap for breakdown ▼'}
			onclick={() => (luckExpanded = !luckExpanded)}
		/>
	</div>

	<!-- Session luck breakdown -->
	{#if luckExpanded && sessionLucks.length > 0}
		<div class="mt-4 rounded-2xl bg-slate-800 p-4">
			<h3 class="mb-2 text-xs font-semibold tracking-widest text-slate-500 uppercase">
				Luck per Session
			</h3>
			<p class="mb-4 text-xs leading-relaxed text-slate-500">
				Each session's luck = average <span class="text-slate-400">(actual − expected)</span> per die,
				where expected is the midpoint of that die's range (e.g. d20 → 10.5, d6 → 3.5). Positive means
				you rolled above average; negative means below.
			</p>
			<div class="flex flex-col gap-1">
				{#each sessionLucks as s (s.id)}
					{@const isOpen = expandedSessionId === s.id}
					{@const summary = isOpen ? sessionSummary(allSessions, s.id) : null}
					<button
						type="button"
						onclick={() => (expandedSessionId = isOpen ? null : s.id)}
						class="w-full rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-700/50"
					>
						<div class="flex items-center justify-between gap-3">
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-semibold text-white">{s.name || 'Unnamed session'}</p>
								<p class="text-xs text-slate-500">{fmtDate(s.rolledAt)}</p>
							</div>
							<div class="flex items-center gap-2">
								<span class={['shrink-0 text-sm font-bold', luckClass(s.luck)]}>{fmtLuck(s.luck)}</span>
								<span class="text-xs text-slate-600">{isOpen ? '▲' : '▼'}</span>
							</div>
						</div>
					</button>
					{#if isOpen && summary}
						<div class="mx-2 mb-2 rounded-xl bg-slate-700/60 px-3 py-3">
							<div class="mb-2 flex gap-4 text-xs text-slate-400">
								<span><span class="font-semibold text-white">{summary.rollCount}</span> rolls</span>
								<span>sum <span class="font-semibold text-white">{summary.totalSum}</span></span>
								<span>avg <span class="font-semibold text-white">{summary.avg}</span></span>
							</div>
							<div class="flex flex-wrap gap-1.5">
								{#each summary.dice as d (d.dieType)}
									<span
										class="rounded-full px-2 py-0.5 text-xs font-bold text-slate-900"
										style="background: {DIE_COLOR[d.dieType] ?? '#94a3b8'}"
									>d{d.dieType} ×{d.count}</span>
								{/each}
							</div>
						</div>
					{/if}
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
	{:else if breakdown.length > 0}
		<DieBreakdown {breakdown} />
	{/if}
</div>

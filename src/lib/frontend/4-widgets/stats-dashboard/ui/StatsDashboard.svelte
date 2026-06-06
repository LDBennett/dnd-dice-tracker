<script lang="ts">
	import { StatCard, DIE_COLOR, Button, TabBar, SelectDropdown } from '@fe-shared/ui';
	import { computeExtended, sessionSummary, fmtLuck, luckClass, fmtDate } from '@fe-shared/lib';
	import type { BreakdownEntry, SessionLuck, SessionRecord } from '@fe-shared/lib';
	import { DieBreakdown, TopDiceList } from '@fe-entities/die';
	import { getAppContext } from '@fe-shared/context';
	import { fetchRollSessions, fetchDashboard } from '../api/statsDashboard.api';
	import SessionStatsPanel from './SessionStatsPanel.svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		totalRolls: number;
		nat20s: number;
		nat1s: number;
	}

	let { totalRolls, nat20s, nat1s }: Props = $props();

	const app = getAppContext();

	let sessionCount = $state(0);
	let topDice = $state<number[]>([]);
	let breakdown = $state<BreakdownEntry[]>([]);
	let sessionLucks = $state<SessionLuck[]>([]);
	let avgLuckPerSession = $state(0);
	let luckExpanded = $state(false);
	let expandedSessionId = $state<string | null>(null);
	let allSessions = $state<SessionRecord[]>([]);

	let activeTab = $state<'overall' | 'session'>('overall');
	let selectedSessionId = $state<string | null>(null);

	const animTotalRolls = tweened(0, { duration: 500, easing: cubicOut });
	const animNat20s     = tweened(0, { duration: 500, easing: cubicOut });
	const animNat1s      = tweened(0, { duration: 500, easing: cubicOut });
	const animSessions   = tweened(0, { duration: 500, easing: cubicOut });

	$effect(() => { animTotalRolls.set(totalRolls); });
	$effect(() => { animNat20s.set(nat20s); });
	$effect(() => { animNat1s.set(nat1s); });
	$effect(() => { animSessions.set(sessionCount); });

	const TAB_ITEMS = [
		{ value: 'overall', label: 'Overall', icon: 'mdi-clipboard-list-outline' },
		{ value: 'session', label: 'Session', icon: 'mdi-thought-bubble-outline' }
	];

	const sessionOptions = $derived(
		allSessions.map((s) => ({
			value: s.id,
			label: s.name || 'Unnamed session',
			subtext: fmtDate(s.rolledAt)
		}))
	);

	const selectedSession = $derived(
		selectedSessionId !== null
			? (allSessions.find((s) => s.id === selectedSessionId) ?? null)
			: null
	);

	function applyExtended(sessions: SessionRecord[]) {
		const ext = computeExtended(sessions);
		sessionCount = ext.sessionCount;
		topDice = ext.topDice;
		breakdown = ext.breakdown;
		sessionLucks = ext.sessionLucks;
		avgLuckPerSession = ext.avgLuckPerSession;
		allSessions = sessions;
	}

	$effect(() => {
		loadExtended();
	});

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
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-bold text-white">{app.isGuest ? "Lee's" : ''} Stats</h2>
		<Button onclick={refresh} aria-label="Refresh stats">↻ Refresh</Button>
	</div>

	<TabBar
		items={TAB_ITEMS}
		value={activeTab}
		onchange={(v) => (activeTab = v as 'overall' | 'session')}
		class="mb-4"
	/>

	{#if activeTab === 'overall'}
		<div class="grid grid-cols-2 gap-4">
			<StatCard label="Total Rolls" value={Math.round($animTotalRolls)} />
			<StatCard label="Top Dice">
				<div class="mt-1 flex gap-2">
					{#if topDice.length === 0}
						<span class="text-4xl font-extrabold text-stone-600">—</span>
					{:else}
						<TopDiceList dice={topDice} />
					{/if}
				</div>
			</StatCard>
			<StatCard label="Nat 20s" value={Math.round($animNat20s)} accent="amber" subtext="d20 critical hits" />
			<StatCard label="Nat 1s" value={Math.round($animNat1s)} accent="red" subtext="d20 critical fails" />
			<StatCard label="Sessions" value={Math.round($animSessions)} />
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

		{#if luckExpanded && sessionLucks.length > 0}
			<div class="mt-4 rounded-2xl bg-stone-800 p-4">
				<h3 class="mb-2 text-xs font-semibold tracking-widest text-stone-500 uppercase">
					Luck per Session
				</h3>
				<p class="mb-4 text-xs leading-relaxed text-stone-500">
					Each session's luck = average <span class="text-stone-400">(actual − expected)</span> per die,
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
							class="w-full rounded-xl px-2 py-2 text-left transition-colors hover:bg-stone-700/50"
						>
							<div class="flex items-center justify-between gap-3">
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-semibold text-white">
										{s.name || 'Unnamed session'}
									</p>
									<p class="text-xs text-stone-500">{fmtDate(s.rolledAt)}</p>
								</div>
								<div class="flex items-center gap-2">
									<span class={['shrink-0 text-sm font-bold', luckClass(s.luck)]}
										>{fmtLuck(s.luck)}</span
									>
									<span class="text-xs text-stone-600">{isOpen ? '▲' : '▼'}</span>
								</div>
							</div>
						</button>
						{#if isOpen && summary}
							<div class="mx-2 mb-2 rounded-xl bg-stone-700/60 px-3 py-3">
								<div class="mb-2 flex gap-4 text-xs text-stone-400">
									<span
										><span class="font-semibold text-white">{summary.rollCount}</span> rolls</span
									>
									<span>sum <span class="font-semibold text-white">{summary.totalSum}</span></span>
									<span>avg <span class="font-semibold text-white">{summary.avg}</span></span>
								</div>
								<div class="flex flex-wrap gap-1.5">
									{#each summary.dice as d (d.dieType)}
										<span
											class="rounded-full px-2 py-0.5 text-xs font-bold text-stone-900"
											style="background: {DIE_COLOR[d.dieType] ?? '#94a3b8'}"
											>d{d.dieType} ×{d.count}</span
										>
									{/each}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		{#if totalRolls === 0}
			<div class="mt-8 text-center text-stone-500">
				<p class="mb-2 text-4xl">🎲</p>
				<p>No rolls logged yet.</p>
				<p class="text-sm">Go roll some dice!</p>
			</div>
		{:else if breakdown.length > 0}
			<DieBreakdown {breakdown} />
		{/if}
	{:else}
		<SelectDropdown
			options={sessionOptions}
			bind:value={selectedSessionId}
			placeholder="Select a session…"
			class="mb-4"
		/>
		{#if selectedSession !== null}
			<SessionStatsPanel session={selectedSession} {sessionLucks} {avgLuckPerSession} />
		{:else}
			<p class="mt-8 text-center text-sm text-stone-500">Select a session to view its stats.</p>
		{/if}
	{/if}
</div>

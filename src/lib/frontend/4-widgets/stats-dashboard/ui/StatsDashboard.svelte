<script lang="ts">
	import { DieBreakdown, TopDiceList } from '@fe-entities/die';
	import { getAppContext } from '@fe-shared/context';
	import { fmtLuck, luckClass,sessionSummary } from '@fe-shared/lib';
	import { Button, DIE_COLOR, SelectDropdown,StatCard, TabBar } from '@fe-shared/ui';
	import { untrack } from 'svelte';

	import { resolve } from '$app/paths';

	import { StatsDashboardState } from '../state/statsDashboard.svelte';
	import SessionStatsPanel from './SessionStatsPanel.svelte';

	interface Props {
		totalRolls: number;
		nat20s: number;
		nat1s: number;
	}

	let { totalRolls, nat20s, nat1s }: Props = $props();

	const s = new StatsDashboardState(
		getAppContext(),
		untrack(() => totalRolls),
		untrack(() => nat20s),
		untrack(() => nat1s)
	);
</script>

<div class="px-4 py-6">
	<div class="mb-4 flex items-center justify-between">
		{#if s.isGuest}
			<SelectDropdown options={s.VIEW_OPTIONS} bind:value={s.viewMode} />
		{:else}
			<h2 class="text-xl font-bold text-white">Stats</h2>
		{/if}
		<Button onclick={() => s.refresh()} aria-label="Refresh stats">↻ Refresh</Button>
	</div>

	<TabBar
		items={s.TAB_ITEMS}
		value={s.activeTab}
		onchange={(v) => (s.activeTab = v as 'overall' | 'session')}
		class="mb-4"
	/>

	{#if s.activeTab === 'overall'}
		<div class="grid grid-cols-2 gap-4">
			<StatCard label="Total Rolls" value={Math.round(s.animTotalRolls.current)} />
			<StatCard label="Top Dice">
				<div class="mt-1 flex gap-2">
					{#if s.topDice.length === 0}
						<span class="text-4xl font-extrabold text-stone-600">—</span>
					{:else}
						<TopDiceList dice={s.topDice} />
					{/if}
				</div>
			</StatCard>
			<StatCard
				label="Nat 20s"
				value={Math.round(s.animNat20s.current)}
				accent="amber"
				subtext="d20 critical hits"
			/>
			<StatCard
				label="Nat 1s"
				value={Math.round(s.animNat1s.current)}
				accent="red"
				subtext="d20 critical fails"
			/>
			<StatCard label="Sessions" value={Math.round(s.animSessions.current)} />
			<StatCard
				label="Avg Luck/Session"
				value={s.sessionCount > 0 ? fmtLuck(s.avgLuckPerSession) : '—'}
				valueColor={s.sessionCount > 0
					? s.avgLuckPerSession > 0.1
						? '#4ade80'
						: s.avgLuckPerSession < -0.1
							? '#f87171'
							: '#94a3b8'
					: '#475569'}
				subtext={s.luckExpanded ? 'tap to collapse ▲' : 'tap for breakdown ▼'}
				onclick={() => (s.luckExpanded = !s.luckExpanded)}
			/>
		</div>

		{#if s.luckExpanded && s.sessionLucks.length > 0}
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
					{#each s.sessionLucks as session (session.id)}
						{@const isOpen = s.expandedSessionId === session.id}
						{@const summary = isOpen ? sessionSummary(s.allSessions, session.id) : null}
						<button
							type="button"
							onclick={() => (s.expandedSessionId = isOpen ? null : session.id)}
							class="w-full rounded-xl px-2 py-2 text-left transition-colors hover:bg-stone-700/50"
						>
							<div class="flex items-center justify-between gap-3">
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-semibold text-white">
										{session.name || 'Unnamed session'}
									</p>
									<p class="text-xs text-stone-500">{session.rolledAt}</p>
								</div>
								<div class="flex items-center gap-2">
									<span class={['shrink-0 text-sm font-bold', luckClass(session.luck)]}
										>{fmtLuck(session.luck)}</span
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

		{#if s.totalRolls === 0}
			<div class="mt-8 text-center text-stone-500">
				<p class="mb-2 text-4xl"><span class="mdi mdi-dice-multiple-outline"></span></p>
				<p>No rolls logged yet.</p>
				<p class="text-sm">Go roll some dice!</p>
			</div>
		{:else if s.breakdown.length > 0}
			<DieBreakdown breakdown={s.breakdown} />
		{/if}
	{:else}
		<SelectDropdown
			options={s.sessionOptions}
			bind:value={s.selectedSessionId}
			placeholder="Select a session…"
			class="mb-4"
		/>
		{#if s.selectedSessionId}
			<a
				href={resolve(`/history?session=${s.selectedSessionId}`)}
				class="text-accent mb-4 flex items-center gap-1 text-xs hover:underline"
			>
				View {s.selectedSession?.name} Roll History
				<span class="mdi mdi-arrow-right-thin"></span>
			</a>
		{/if}
		{#if s.selectedSession !== null}
			<SessionStatsPanel
				session={s.selectedSession}
				sessionLucks={s.sessionLucks}
				avgLuckPerSession={s.avgLuckPerSession}
			/>
		{:else}
			<p class="mt-8 text-center text-sm text-stone-500">Select a session to view its stats.</p>
		{/if}
	{/if}
</div>

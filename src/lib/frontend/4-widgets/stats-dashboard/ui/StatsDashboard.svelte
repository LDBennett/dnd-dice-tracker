<script lang="ts">
	import { DieBreakdown, TopDiceList } from '@fe-entities/die';
	import { getAppContext } from '@fe-shared/context';
	import { fmtLuck } from '@fe-shared';
	import { Button, SelectDropdown, StatCard, TabBar } from '@fe-shared/ui';
	import { untrack } from 'svelte';

	import { resolve } from '$app/paths';

	import { StatsDashboardState } from '../state/statsDashboard.svelte';
	import LuckBreakdownPanel from './LuckBreakdownPanel.svelte';
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
			<LuckBreakdownPanel
				sessionLucks={s.sessionLucks}
				expandedSessionId={s.expandedSessionId}
				allSessions={s.allSessions}
				onToggle={(id) => (s.expandedSessionId = s.expandedSessionId === id ? null : id)}
			/>
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

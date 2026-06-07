<script lang="ts">
	import { StatCard } from '@fe-shared/ui';
	import { singleSessionStats, fmtLuck, luckClass, fmtDate } from '@fe-shared/lib';
	import type { SessionRecord, SessionLuck } from '@fe-shared/lib';
	import { DieBreakdown, TopDiceList } from '@fe-entities/die';

	let {
		session,
		sessionLucks = [],
		avgLuckPerSession = 0
	}: {
		session: SessionRecord;
		sessionLucks?: SessionLuck[];
		avgLuckPerSession?: number;
	} = $props();

	const stats = $derived(singleSessionStats(session));
	const luckDiff = $derived(
		stats.luck !== null ? Number((stats.luck - avgLuckPerSession).toFixed(2)) : null
	);
	const rankedLucks = $derived([...sessionLucks].sort((a, b) => b.luck - a.luck));

	let luckExpanded = $state(false);
</script>

<div class="grid grid-cols-2 gap-4">
	<StatCard label="Total Rolls" value={stats.totalRolls} />
	<StatCard label="Top Dice">
		<div class="mt-1 flex gap-2">
			{#if stats.topDice.length === 0}
				<span class="text-4xl font-extrabold text-stone-600">—</span>
			{:else}
				<TopDiceList dice={stats.topDice} />
			{/if}
		</div>
	</StatCard>
	<StatCard label="Nat 20s" value={stats.nat20s} accent="amber" subtext="d20 critical hits" />
	<StatCard label="Nat 1s" value={stats.nat1s} accent="red" subtext="d20 critical fails" />
	<StatCard
		label="Luck"
		value={stats.luck !== null ? fmtLuck(stats.luck) : '—'}
		valueColor={stats.luck !== null
			? stats.luck > 0.1
				? '#4ade80'
				: stats.luck < -0.1
					? '#f87171'
					: '#94a3b8'
			: '#475569'}
		subtext="avg (actual − expected)"
	/>
	<StatCard
		label="Luck vs. Sessions"
		value={luckDiff !== null ? fmtLuck(luckDiff) : '—'}
		valueColor={luckDiff !== null
			? luckDiff > 0.1
				? '#4ade80'
				: luckDiff < -0.1
					? '#f87171'
					: '#94a3b8'
			: '#475569'}
		subtext={luckDiff !== null
			? luckExpanded
				? 'tap to collapse ▲'
				: 'tap for ranking ▼'
			: 'no rolls yet'}
		onclick={luckDiff !== null ? () => (luckExpanded = !luckExpanded) : undefined}
	/>
</div>

{#if luckExpanded && rankedLucks.length > 0}
	<div class="mt-4 rounded-2xl bg-stone-800 p-4">
		<h3 class="mb-3 text-xs font-semibold tracking-widest text-stone-500 uppercase">
			Session Ranking
		</h3>
		<div class="flex flex-col gap-0.5">
			{#each rankedLucks as s, i (s.id)}
				{@const isCurrent = s.id === session.id}
				<div
					class={[
						'flex items-center gap-3 rounded-xl px-2 py-2',
						isCurrent ? 'bg-stone-700/80' : ''
					]}
				>
					<span class="w-5 shrink-0 text-xs tabular-nums text-stone-600">{i + 1}</span>
					<div class="min-w-0 flex-1">
						<p class={['truncate text-sm font-semibold', isCurrent ? 'text-accent' : 'text-white']}>
							{s.name || 'Unnamed session'}
						</p>
						<p class="text-xs text-stone-500">{fmtDate(s.rolledAt)}</p>
					</div>
					<span class={['shrink-0 text-sm font-bold', luckClass(s.luck)]}>{fmtLuck(s.luck)}</span>
				</div>
			{/each}
		</div>
	</div>
{/if}

{#if stats.totalRolls === 0}
	<div class="mt-8 text-center text-stone-500">
		<p class="mb-2 text-4xl">🎲</p>
		<p>No rolls in this session.</p>
	</div>
{:else if stats.breakdown.length > 0}
	<DieBreakdown breakdown={stats.breakdown} />
{/if}

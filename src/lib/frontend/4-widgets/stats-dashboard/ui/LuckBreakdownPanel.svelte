<script lang="ts">
	import type { SessionLuck, SessionRecord } from '@fe-shared';
	import { fmtLuck, luckClass, sessionSummary } from '@fe-shared';
	import { DIE_COLOR } from '@fe-shared/ui';

	interface Props {
		sessionLucks: SessionLuck[];
		expandedSessionId: string | null;
		allSessions: SessionRecord[];
		onToggle: (id: string) => void;
	}

	let { sessionLucks, expandedSessionId, allSessions, onToggle }: Props = $props();
</script>

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
		{#each sessionLucks as session (session.id)}
			{@const isOpen = expandedSessionId === session.id}
			{@const summary = isOpen ? sessionSummary(allSessions, session.id) : null}
			<button
				type="button"
				onclick={() => onToggle(session.id)}
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
						<span><span class="font-semibold text-white">{summary.rollCount}</span> rolls</span>
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

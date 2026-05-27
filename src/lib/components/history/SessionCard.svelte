<script lang="ts">
	import { fade } from 'svelte/transition';

	interface RollRecord { dieType: number; value: number; note: string; }
	interface Session {
		id: string;
		rolls: RollRecord[];
		modifier: number;
		rolledAt: string;
		name: string;
		total: number;
	}

	let {
		session,
		isGuest = false,
		savingId = null,
		savedId = null,
		onSaveName,
		onSaveRolls
	}: {
		session: Session;
		isGuest?: boolean;
		savingId?: string | null;
		savedId?: string | null;
		onSaveName: (id: string, name: string) => void;
		onSaveRolls: (id: string, rolls: RollRecord[]) => void;
	} = $props();

	let name  = $state(session.name);
	let rolls = $state(session.rolls.map((r) => ({ ...r })));

	const DIE_COLOR: Record<number, string> = {
		4: '#f87171', 6: '#fb923c', 8: '#facc15',
		10: '#4ade80', 12: '#2dd4bf', 20: '#fbbf24', 100: '#c084fc'
	};
	function dieColor(t: number) { return DIE_COLOR[t] ?? '#94a3b8'; }

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
	}
	function formatTime(iso: string) {
		return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
	}
</script>

<div class="rounded-2xl bg-slate-800 p-4">
	<!-- Session name -->
	<div class="relative mb-3">
		{#if isGuest}
			<p class="px-3 py-2 text-sm font-semibold text-white">{name || 'Unnamed session'}</p>
		{:else}
			<input
				type="text"
				bind:value={name}
				onblur={() => onSaveName(session.id, name)}
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
		{#each rolls as roll, i (i)}
			<div class="flex items-center gap-2">
				<span
					class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-slate-900"
					style="background: {dieColor(roll.dieType)}">d{roll.dieType}→{roll.value}</span
				>
				{#if isGuest}
					{#if roll.note}
						<span class="min-w-0 flex-1 text-xs leading-5 text-slate-400">{roll.note}</span>
					{/if}
				{:else}
					<input
						type="text"
						bind:value={rolls[i].note}
						onblur={() => onSaveRolls(session.id, rolls)}
						placeholder="Note…"
						class="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-700/60 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 focus:outline-none"
					/>
				{/if}
			</div>
		{/each}
		{#if session.modifier !== 0}
			<span class="self-start rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
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
		>✓ Saved</p>
	{/if}
</div>

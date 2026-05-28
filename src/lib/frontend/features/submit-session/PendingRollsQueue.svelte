<script lang="ts">
	import { DIE_COLOR } from '$lib/frontend/shared/ui/dice-colors';

	type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;
	interface RollResult { dieType: DieType; value: number; note: string; }

	let {
		rolls,
		isGuest = false,
		submitting = false,
		saveError = null,
		sessionName = $bindable(''),
		onSubmit,
		onClear
	}: {
		rolls: RollResult[];
		isGuest?: boolean;
		submitting?: boolean;
		saveError?: string | null;
		sessionName: string;
		onSubmit: () => void;
		onClear: () => void;
	} = $props();
</script>

<div class="rounded-2xl bg-slate-800 p-4">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="text-sm font-semibold text-slate-300">This session</h3>
		<button type="button" onclick={onClear} class="text-xs text-slate-500 hover:text-slate-300">Clear</button>
	</div>

	<div class="mb-4 flex flex-col gap-2">
		{#each rolls as roll, i (i)}
			<div class="flex items-start gap-2">
				<span
					class="mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold text-slate-900"
					style="background: {DIE_COLOR[roll.dieType]}"
				>d{roll.dieType}→{roll.value}</span>
				{#if roll.note}
					<span class="text-xs leading-5 text-slate-400">{roll.note}</span>
				{/if}
			</div>
		{/each}
	</div>

	<input
		type="text"
		bind:value={sessionName}
		placeholder="Session name (optional)"
		class="mb-3 w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 focus:outline-none"
	/>

	{#if saveError}
		<p class="mb-2 rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-400">{saveError}</p>
	{/if}

	<div class="flex items-center justify-between">
		<span class="text-sm text-slate-400">
			<span class="font-bold text-white">{rolls.length}</span>
			{rolls.length === 1 ? 'roll' : 'rolls'}
		</span>
		<button
			type="button"
			onclick={onSubmit}
			disabled={submitting}
			class="rounded-xl px-6 py-3 text-sm font-bold transition active:scale-95 disabled:opacity-50 {isGuest
				? 'border border-amber-400 text-amber-400 hover:bg-amber-400/10'
				: 'bg-amber-400 text-slate-900 hover:bg-amber-300'}"
		>{submitting ? 'Saving…' : isGuest ? 'Sign in to save' : 'Save Session'}</button>
	</div>
</div>

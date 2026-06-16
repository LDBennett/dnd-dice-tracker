<script lang="ts">
	import type { DieType, RollRecord } from '@fe-shared';
	import { DIE_COLOR } from '@fe-shared/ui';
	import { IconButton, TextInput } from '@fe-shared/ui';

	import type { SessionCardState } from '../state/sessionCard.svelte';

	const DIE_TYPES: DieType[] = [4, 6, 8, 10, 12, 20, 100];

	let {
		s,
		sessionId,
		onSaveRolls
	}: {
		s: SessionCardState;
		sessionId: string;
		onSaveRolls: (id: string, rolls: RollRecord[]) => void;
	} = $props();

	const isValid = $derived(s.addRollValue >= 1 && s.addRollValue <= s.addRollDie);
</script>

<div class="mt-3 flex flex-col gap-2 border-t border-stone-700/40 pt-3">
	<!-- Die type chips -->
	<div class="flex flex-wrap gap-1.5">
		{#each DIE_TYPES as die (die)}
			<button
				type="button"
				onclick={() => {
					s.addRollDie = die;
					s.addRollValue = 1;
				}}
				class={[
					'rounded-lg px-2.5 py-1 text-xs font-semibold transition',
					s.addRollDie === die
						? 'text-stone-900'
						: 'bg-stone-700/60 text-stone-400 hover:bg-stone-700 hover:text-white'
				]}
				style={s.addRollDie === die ? `background-color: ${DIE_COLOR[die]};` : ''}
			>
				d{die}
			</button>
		{/each}
	</div>

	<!-- Value + note + actions -->
	<div class="flex items-center gap-2">
		<input
			type="number"
			min="1"
			max={s.addRollDie}
			bind:value={s.addRollValue}
			class="w-16 shrink-0 rounded-lg bg-stone-700/60 px-2 py-1.5 text-center text-sm text-white outline-none focus:ring-1 focus:ring-stone-500"
			aria-label="Roll value"
		/>
		<TextInput
			bind:value={s.addRollNote}
			placeholder="Note (optional)"
			class="flex-1 text-sm"
		/>
		<IconButton
			icon="mdi-check"
			size="sm"
			onclick={() => s.submitAddRoll(sessionId, onSaveRolls)}
			disabled={!isValid}
			aria-label="Confirm roll"
		/>
		<IconButton
			icon="mdi-close"
			size="sm"
			onclick={() => {
				s.addingRoll = false;
				s.addRollDie = 20;
				s.addRollValue = 1;
				s.addRollNote = '';
			}}
			aria-label="Cancel"
		/>
	</div>
</div>

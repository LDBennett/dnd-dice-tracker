<script lang="ts">
	import type { RollRecord, SessionRecord } from '@fe-shared';
	import { fmtLuck, fmtTime, luckClass, singleSessionStats } from '@fe-shared/utils/dice-utils';
	import { Badge, ConfirmModal, IconButton, TextInput } from '@fe-shared/ui';
	import { untrack } from 'svelte';
	import { backOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';

	import { SessionCardState } from '../state/sessionCard.svelte';
	import EditRollModal from './SessionCard.EditRollModal.svelte';
	import RollGridCell from './SessionCard.RollGridCell.svelte';

	let {
		session,
		isGuest = false,
		live = false,
		editMode = false,
		savingId = null,
		savedId = null,
		onSaveName,
		onSaveRolls,
		onDelete
	}: {
		session: SessionRecord;
		isGuest?: boolean;
		live?: boolean;
		editMode?: boolean;
		savingId?: string | null;
		savedId?: string | null;
		onSaveName: (id: string, name: string) => void;
		onSaveRolls: (id: string, rolls: RollRecord[]) => void;
		onDelete: (id: string) => void;
	} = $props();

	const s = new SessionCardState(untrack(() => session));

	// Live mode: append new rolls without overwriting in-progress edits; reset on clear
	$effect(() => {
		if (!live) return;
		const incoming = session;
		const localLen = untrack(() => s.rolls.length);
		if (incoming.rolls.length === 0) {
			s.rolls = [];
			s.name = incoming.name;
		} else if (incoming.rolls.length > localLen) {
			s.rolls = [
				...untrack(() => s.rolls),
				...incoming.rolls.slice(localLen).map((r) => ({ ...r }))
			];
		}
	});

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="rounded-2xl bg-stone-800 p-4">
	<!-- Session name -->
	{#if !live}
		<div class="relative mb-3 flex items-center gap-2">
			{#if isGuest || !editMode}
				<p
					class={['flex-1 py-2 text-sm font-semibold text-white', !isGuest || (editMode && 'px-3')]}
				>
					{s.name || 'Unnamed session'}
				</p>
			{:else}
				<TextInput
					bind:value={s.name}
					onblur={() => onSaveName(session.id, s.name)}
					placeholder="Unnamed session"
					class="flex-1 font-semibold"
				/>
				<IconButton
					icon="mdi-trash-can-outline"
					size="sm"
					iconSize="lg"
					hoverColor="red"
					rounded="lg"
					onclick={() => (s.confirmingDelete = true)}
					aria-label="Delete session"
				/>
			{/if}
		</div>
	{/if}

	<!-- Date + total -->
	<div class="mb-3 flex items-center justify-between">
		{#if !live}
			<div>
				<p class="text-xs font-semibold text-stone-400">{formatDate(session.rolledAt)}</p>
				<p class="text-xs text-stone-500">{fmtTime(session.rolledAt)}</p>
			</div>
			<div class="text-right">
				<p class="text-xs text-stone-500">Total Rolls</p>
				<p class="text-accent text-lg font-black">{session.rolls.length}</p>
			</div>
		{:else}
			<div class="flex items-center gap-1">
				<p class="text-base text-stone-500">Rolls:</p>
				<p class="text-accent text-lg font-black">{session.rolls.length}</p>
			</div>
			<div class="text-right">
				<p class="text-xs text-stone-500">Luck</p>
				<p class={['text-lg font-black', luckClass(singleSessionStats(session).luck ?? 0)]}>
					{fmtLuck(singleSessionStats(session).luck ?? 0)}
				</p>
			</div>
		{/if}
	</div>

	<!-- Per-roll grid / edit list -->
	{#key editMode}
		<div class={editMode ? 'flex flex-col gap-2' : 'grid grid-cols-3 gap-2 md:grid-cols-4'}>
			{#each s.rolls as roll, i (i)}
				<div in:scale={{ delay: i * 25, duration: 220, start: 0.75, easing: backOut }}>
					<RollGridCell
						dieType={roll.dieType}
						value={roll.value}
						bind:note={s.rolls[i].note}
						index={i}
						{editMode}
						{isGuest}
						onedit={() => (s.editingIndex = i)}
						onblur={() => onSaveRolls(session.id, s.rolls)}
						ondelete={() => s.deleteRoll(i, session.id, onSaveRolls, onDelete)}
					/>
				</div>
			{/each}
		</div>
	{/key}
	{#if session.modifier !== 0}
		<Badge variant="neutral" class="mt-2 self-start">
			modifier {session.modifier >= 0 ? `+${session.modifier}` : session.modifier}
		</Badge>
	{/if}

	<!-- Save indicator -->
	{#if !isGuest && savingId === session.id}
		<p class="mt-2 text-right text-xs text-stone-500">Saving…</p>
	{:else if !isGuest && savedId === session.id}
		<p
			in:fade={{ duration: 150 }}
			out:fade={{ duration: 400 }}
			class="text-accent mt-2 text-right text-xs font-semibold"
		>
			<span class="mdi mdi-check"></span> Saved
		</p>
	{/if}
</div>

{#if s.editingIndex !== null}
	<EditRollModal
		dieType={s.rolls[s.editingIndex].dieType as 4 | 6 | 8 | 10 | 12 | 20 | 100}
		currentValue={s.rolls[s.editingIndex].value}
		onConfirm={(v) => s.handleEditConfirm(s.editingIndex!, v, session.id, onSaveRolls)}
		onCancel={() => (s.editingIndex = null)}
	/>
{/if}

{#if s.confirmingDelete}
	<ConfirmModal
		title="Delete session?"
		message="This will permanently remove the session and all its rolls."
		confirmLabel="Delete"
		onConfirm={() => {
			s.confirmingDelete = false;
			onDelete(session.id);
		}}
		onCancel={() => (s.confirmingDelete = false)}
	/>
{/if}

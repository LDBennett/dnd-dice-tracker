<script lang="ts">
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import { DIE_COLOR, IconButton, Badge, ConfirmModal, TextInput } from '@fe-shared/ui';
	import { singleSessionStats, fmtLuck, luckClass } from '@fe-shared/lib/utils/dice-utils';
	import type { RollRecord, SessionRecord } from '@fe-shared/lib';
	import { DieChip } from '@fe-entities/die';
	import EditRollModal from './EditRollModal.svelte';

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

	let name = $state(untrack(() => session.name));
	let rolls = $state(untrack(() => session.rolls.map((r) => ({ ...r }))));
	let editingIndex = $state<number | null>(null);
	let confirmingDelete = $state(false);

	// In live mode: append new rolls without overwriting in-progress edits; reset on clear
	$effect(() => {
		if (!live) return;
		const incoming = session;
		const localLen = untrack(() => rolls.length);
		if (incoming.rolls.length === 0) {
			rolls = [];
			name = incoming.name;
		} else if (incoming.rolls.length > localLen) {
			rolls = [...untrack(() => rolls), ...incoming.rolls.slice(localLen).map((r) => ({ ...r }))];
		}
	});

	function handleEditConfirm(index: number, value: number) {
		rolls[index].value = value;
		editingIndex = null;
		onSaveRolls(session.id, rolls);
	}

	function deleteRoll(index: number) {
		const updated = rolls.filter((_, i) => i !== index);
		if (updated.length === 0) onDelete(session.id);
		else onSaveRolls(session.id, updated);
	}

	function dieColor(t: number) {
		return DIE_COLOR[t] ?? '#94a3b8';
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
	function formatTime(iso: string) {
		return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
	}
</script>

<div class="rounded-2xl bg-stone-800 p-4">
	<!-- Session name -->
	{#if !live}
		<div class="relative mb-3 flex items-center gap-2">
			{#if isGuest || !editMode}
				<p class={['flex-1 py-2 text-sm font-semibold text-white', !isGuest && 'px-3']}>
					{name || 'Unnamed session'}
				</p>
			{:else}
				<TextInput
					bind:value={name}
					onblur={() => onSaveName(session.id, name)}
					placeholder="Unnamed session"
					class="flex-1 font-semibold"
				/>
				<IconButton
					icon="mdi-trash-can-outline"
					size="sm"
					iconSize="lg"
					hoverColor="red"
					rounded="lg"
					onclick={() => (confirmingDelete = true)}
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
				<p class="text-xs text-stone-500">{formatTime(session.rolledAt)}</p>
			</div>
			<div class="text-right">
				<p class="text-xs text-stone-500">Total Rolls</p>
				<p class="text-lg font-black text-accent">{session.rolls.length}</p>
			</div>
		{:else}
			<div class="flex items-center gap-1">
				<p class="text-base text-stone-500">Rolls:</p>
				<p class="text-lg font-black text-accent">{session.rolls.length}</p>
			</div>
			<div class="text-right">
				<p class="text-xs text-stone-500">Luck</p>
				<p class={['text-lg font-black', luckClass(singleSessionStats(session).luck ?? 0)]}>
					{fmtLuck(singleSessionStats(session).luck ?? 0)}
				</p>
			</div>
		{/if}
	</div>

	<!-- Per-roll editors -->
	<div class="flex flex-col gap-2">
		{#each rolls as roll, i (i)}
			<div class="flex items-center gap-2">
				{#if isGuest || !editMode}
					<span
						class="flex w-16 shrink-0 flex-col items-center gap-1 rounded-3xl px-2 py-2.5 font-bold text-stone-900"
						style="background: {dieColor(roll.dieType)}"
					>
						<DieChip dieType={roll.dieType} value={roll.value} />
					</span>
					{#if roll.note}
						<span class="min-w-1 flex-1 text-xs leading-5 text-stone-400">{roll.note}</span>
					{/if}
				{:else}
					<button
						type="button"
						onclick={() => (editingIndex = i)}
						title="Edit roll value"
						class="flex w-16 shrink-0 flex-col items-center gap-1 rounded-3xl px-2 py-2.5 font-bold text-stone-900 ring-offset-stone-800 transition hover:scale-105 hover:ring-2 hover:brightness-125 active:scale-95"
						style="background: {dieColor(roll.dieType)}; --tw-ring-color: {dieColor(
							roll.dieType
						)}60;"
					>
						<DieChip dieType={roll.dieType} value={roll.value} />
					</button>
					<input
						id={'note-' + i}
						type="text"
						bind:value={rolls[i].note}
						onblur={() => onSaveRolls(session.id, rolls)}
						placeholder="Notes (optional)"
						class="flex-1 rounded-lg border border-stone-600 bg-stone-700/60 px-2.5 py-1.5 text-xs text-white placeholder-stone-500 accent-focus"
					/>
					<IconButton
						icon="mdi-trash-can-outline"
						size="sm"
						hoverColor="red"
						rounded="lg"
						onclick={() => deleteRoll(i)}
						aria-label="Delete roll"
					/>
				{/if}
			</div>
		{/each}
		{#if session.modifier !== 0}
			<Badge variant="neutral" class="self-start">
				modifier {session.modifier >= 0 ? `+${session.modifier}` : session.modifier}
			</Badge>
		{/if}
	</div>

	<!-- Save indicator -->
	{#if !isGuest && savingId === session.id}
		<p class="mt-2 text-right text-xs text-stone-500">Saving…</p>
	{:else if !isGuest && savedId === session.id}
		<p
			in:fade={{ duration: 150 }}
			out:fade={{ duration: 400 }}
			class="mt-2 text-right text-xs font-semibold text-accent"
		>
			<span class="mdi mdi-check"></span> Saved
		</p>
	{/if}
</div>

{#if editingIndex !== null}
	<EditRollModal
		dieType={rolls[editingIndex].dieType as 4 | 6 | 8 | 10 | 12 | 20 | 100}
		currentValue={rolls[editingIndex].value}
		onConfirm={(v) => handleEditConfirm(editingIndex!, v)}
		onCancel={() => (editingIndex = null)}
	/>
{/if}

{#if confirmingDelete}
	<ConfirmModal
		title="Delete session?"
		message="This will permanently remove the session and all its rolls."
		confirmLabel="Delete"
		onConfirm={() => {
			confirmingDelete = false;
			onDelete(session.id);
		}}
		onCancel={() => (confirmingDelete = false)}
	/>
{/if}

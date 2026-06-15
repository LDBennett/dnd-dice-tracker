<script lang="ts">
	import { SessionCard } from '@fe-entities/session';
	import { getAppContext } from '@fe-shared/context';
	import type { SessionRecord } from '@fe-shared';
	import { Button, SelectDropdown } from '@fe-shared/ui';
	import { untrack } from 'svelte';

	import { HistoryEditorState } from '../state/historyEditor.svelte';

	interface Props {
		initialSessionId?: string | null;
	}
	let { initialSessionId = null }: Props = $props();

	const s = new HistoryEditorState(untrack(() => initialSessionId ?? ''), getAppContext());
</script>

<div class="px-4 py-6">
	<div class="mb-5 flex items-center justify-between">
		<h2 class="text-xl font-bold text-white">{s.isGuest ? "Lee's" : 'Your'} Roll History</h2>
		<div class="flex items-center gap-2">
			{#if !s.isGuest}
				<Button
					onclick={() => (s.editMode = !s.editMode)}
					class={`flex-full  flex items-center gap-1${s.editMode ? ' text-accent!' : ''}`}
				>
					<span class="mdi mdi-book-edit-outline text-lg"></span>
					<span class="block md:hidden">Edit</span>
					<span class="hidden md:block">Batch Edit</span>
				</Button>
			{/if}
			<Button onclick={() => s.loadSessions()}>↻ Refresh</Button>
		</div>
	</div>

	{#if s.loading}
		<div class="py-16 text-center text-stone-500">Loading…</div>
	{:else if s.sessions.length === 0}
		<div class="py-16 text-center text-stone-500">
			<p class="mb-2 text-4xl">📜</p>
			<p>No sessions yet. Go roll some dice!</p>
		</div>
	{:else}
		<SelectDropdown options={s.sessionOptions} bind:value={s.selectedSessionId} class="mb-4" />
		{#if s.displayedSessions.length === 0}
			<div class="py-16 text-center text-stone-500">No session found.</div>
		{:else}
			<div class="flex flex-col gap-4">
				{#each s.displayedSessions as session (session.id)}
					<SessionCard
						{session}
						isGuest={s.isGuest}
						editMode={s.editMode}
						savingId={s.savingId}
						savedId={s.savedId}
						onSaveName={(id, name) => s.saveName(id, name)}
						onSaveRolls={(id, rolls) => s.saveRolls(id, rolls as SessionRecord['rolls'])}
						onDelete={(id) => s.deleteSession(id)}
					/>
				{/each}
			</div>
		{/if}
	{/if}
</div>

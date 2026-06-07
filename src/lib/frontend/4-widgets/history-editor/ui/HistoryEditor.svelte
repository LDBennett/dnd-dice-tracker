<script lang="ts">
	import { SessionCard } from '@fe-entities/session';
	import { getAppContext } from '@fe-shared/context';
	import { Button, IconButton } from '@fe-shared/ui';
	import { fetchSessions as apiFetchSessions, patchSession, deleteSession as apiDeleteSession } from '../api/historyEditor.api';
	import type { SessionRecord, RollRecord } from '@fe-shared/lib';

	const app = getAppContext();

	let sessions  = $state<SessionRecord[]>([]);
	let loading   = $state(true);
	let savingId  = $state<string | null>(null);
	let savedId   = $state<string | null>(null);
	let editMode  = $state(false);

	$effect(() => { fetchSessions(); });

	async function fetchSessions() {
		loading = true;
		try {
			sessions = await apiFetchSessions();
		} finally {
			loading = false;
		}
	}

	async function saveName(id: string, name: string) {
		await patch(id, { name });
	}

	async function saveRolls(id: string, rolls: RollRecord[]) {
		await patch(id, { rolls });
	}

	async function patch(id: string, body: object) {
		savingId = id;
		try {
			await patchSession(id, body);
			savedId = id;
			setTimeout(() => { if (savedId === id) savedId = null; }, 1800);
		} finally {
			savingId = null;
		}
	}

	async function deleteSession(id: string) {
		await apiDeleteSession(id);
		sessions = sessions.filter(s => s.id !== id);
	}
</script>

<div class="px-4 py-6">
	<div class="mb-5 flex items-center justify-between">
		<h2 class="text-xl font-bold text-white">{app.isGuest ? "Lee's" : 'Your'} Roll History</h2>
		<div class="flex items-center gap-2">
			<IconButton
				icon="mdi-book-edit-outline"
				size="sm"
				iconSize="lg"
				rounded="lg"
				onclick={() => (editMode = !editMode)}
				aria-label="Toggle edit mode"
				class={editMode ? 'text-accent!' : ''}
			/>
			<Button onclick={fetchSessions}>↻ Refresh</Button>
		</div>
	</div>

	{#if loading}
		<div class="py-16 text-center text-stone-500">Loading…</div>
	{:else if sessions.length === 0}
		<div class="py-16 text-center text-stone-500">
			<p class="mb-2 text-4xl">📜</p>
			<p>No sessions yet. Go roll some dice!</p>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each sessions as session (session.id)}
				<SessionCard
					{session}
					isGuest={app.isGuest}
					{editMode}
					{savingId}
					{savedId}
					onSaveName={saveName}
					onSaveRolls={saveRolls}
					onDelete={deleteSession}
				/>
			{/each}
		</div>
	{/if}
</div>

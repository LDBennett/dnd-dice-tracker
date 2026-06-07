<script lang="ts">
	import { SessionCard } from '@fe-entities/session';
	import { getAppContext } from '@fe-shared/context';
	import { Button, SelectDropdown } from '@fe-shared/ui';
	import {
		fetchSessions as apiFetchSessions,
		patchSession,
		deleteSession as apiDeleteSession
	} from '../api/historyEditor.api';
	import type { SessionRecord, RollRecord } from '@fe-shared/lib';
	import { fmtDate } from '@fe-shared/lib';
	import { untrack } from 'svelte';

	interface Props {
		initialSessionId?: string | null;
	}
	let { initialSessionId = null }: Props = $props();

	const app = getAppContext();

	let sessions = $state<SessionRecord[]>([]);
	let loading = $state(true);
	let savingId = $state<string | null>(null);
	let savedId = $state<string | null>(null);
	let editMode = $state(false);
	let selectedSessionId = $state<string>(untrack(() => initialSessionId ?? ''));

	const sessionOptions = $derived([
		{ value: '', label: 'All sessions' },
		...sessions.map((s) => ({
			value: s.id,
			label: s.name || 'Unnamed session',
			subtext: fmtDate(s.rolledAt)
		}))
	]);

	const displayedSessions = $derived(
		selectedSessionId !== '' ? sessions.filter((s) => s.id === selectedSessionId) : sessions
	);

	$effect(() => {
		const id = selectedSessionId;
		const url = new URL(window.location.href);
		if (id) url.searchParams.set('session', id);
		else url.searchParams.delete('session');
		window.history.replaceState({}, '', url.pathname + url.search);
	});

	$effect(() => {
		fetchSessions();
	});

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
			setTimeout(() => {
				if (savedId === id) savedId = null;
			}, 1800);
		} finally {
			savingId = null;
		}
	}

	async function deleteSession(id: string) {
		await apiDeleteSession(id);
		sessions = sessions.filter((s) => s.id !== id);
	}
</script>

<div class="px-4 py-6">
	<div class="mb-5 flex items-center justify-between">
		<h2 class="text-xl font-bold text-white">{app.isGuest ? "Lee's" : 'Your'} Roll History</h2>
		<div class="flex items-center gap-2">
			<Button
				onclick={() => (editMode = !editMode)}
				class={`flex-full  flex items-center gap-1${editMode ? ' text-accent!' : ''}`}
			>
				<span class="mdi mdi-book-edit-outline text-lg"></span>
				<span class="block md:hidden">Edit</span>
				<span class="hidden md:block">Batch Edit</span>
			</Button>
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
		<SelectDropdown options={sessionOptions} bind:value={selectedSessionId} class="mb-4" />
		{#if displayedSessions.length === 0}
			<div class="py-16 text-center text-stone-500">No session found.</div>
		{:else}
			<div class="flex flex-col gap-4">
				{#each displayedSessions as session (session.id)}
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
	{/if}
</div>

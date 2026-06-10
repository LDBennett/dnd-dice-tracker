import type { AppContext } from '@fe-shared/context';
import type { RollRecord,SessionRecord } from '@fe-shared/lib';
import { fmtDate } from '@fe-shared/lib';
import { untrack } from 'svelte';

import {
	deleteSession as apiDeleteSession,
	fetchSessions as apiFetchSessions,
	patchSession} from '../api/historyEditor.api';

export class HistoryEditorState {
	sessions = $state<SessionRecord[]>([]);
	loading = $state(true);
	savingId = $state<string | null>(null);
	savedId = $state<string | null>(null);
	editMode = $state(false);
	selectedSessionId = $state('');

	get sessionOptions() {
		return [
			{ value: '', label: 'All sessions' },
			...this.sessions.map((s) => ({
				value: s.id,
				label: s.name || 'Unnamed session',
				subtext: fmtDate(s.rolledAt)
			}))
		];
	}

	get displayedSessions(): SessionRecord[] {
		return this.selectedSessionId !== ''
			? this.sessions.filter((s) => s.id === this.selectedSessionId)
			: this.sessions;
	}

	get isGuest(): boolean {
		return this.app.isGuest;
	}

	constructor(
		initialSessionId: string,
		private app: AppContext
	) {
		this.selectedSessionId = untrack(() => initialSessionId);

		$effect(() => {
			const id = this.selectedSessionId;
			const search = id ? `?session=${encodeURIComponent(id)}` : '';
			window.history.replaceState({}, '', window.location.pathname + search);
		});

		$effect(() => {
			untrack(() => this.loadSessions());
		});
	}

	async loadSessions() {
		this.loading = true;
		try {
			this.sessions = await apiFetchSessions();
		} finally {
			this.loading = false;
		}
	}

	async saveName(id: string, name: string) {
		await this.patch(id, { name });
	}

	async saveRolls(id: string, rolls: RollRecord[]) {
		await this.patch(id, { rolls });
	}

	async patch(id: string, body: object) {
		this.savingId = id;
		try {
			await patchSession(id, body);
			this.savedId = id;
			setTimeout(() => {
				if (this.savedId === id) this.savedId = null;
			}, 1800);
		} finally {
			this.savingId = null;
		}
	}

	async deleteSession(id: string) {
		await apiDeleteSession(id);
		this.sessions = this.sessions.filter((s) => s.id !== id);
	}
}

import type { ISession, SessionRecord } from '@fe-shared/lib';
import { SvelteDate } from 'svelte/reactivity';

import { submitRollSession, updateRollSession } from '../api/sessionApi';
import type { RollResult } from '../types/session.types';

export class Session implements ISession {
	currentSessionId = $state<string | null>(null);
	currentSessionRolls = $state<RollResult[]>([]);
	currentSessionName = $state('');
	rolledAt = $state<string | null>(null);
	saving = $state(false);
	saveError = $state<string | null>(null);
	guestMode = $state(false);

	async autoSave(rolls: RollResult[]): Promise<void> {
		if (this.guestMode) {
			if (!this.currentSessionId) {
				this.currentSessionId = crypto.randomUUID();
				this.rolledAt = new SvelteDate().toISOString();
			}
			this.currentSessionRolls = [...this.currentSessionRolls, ...rolls];
			return;
		}
		this.saving = true;
		this.saveError = null;
		try {
			const result = await submitRollSession(rolls, '', this.currentSessionId ?? undefined);
			if (!this.currentSessionId) {
				this.currentSessionId = result.sessionId;
				this.rolledAt = new SvelteDate().toISOString();
			}
			this.currentSessionRolls = [...this.currentSessionRolls, ...rolls];
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Network error';
			if (msg.includes('Session not found') && this.currentSessionId) {
				// Stale localStorage ID — session was deleted server-side. Reset and create a new one.
				this.reset();
				return this.autoSave(rolls);
			}
			this.saveError = msg;
		} finally {
			this.saving = false;
		}
	}

	async patch(fields: { name?: string; rolls?: RollResult[] }) {
		if (!this.currentSessionId) return;
		if (fields.rolls !== undefined) this.currentSessionRolls = fields.rolls;
		if (fields.name !== undefined) this.currentSessionName = fields.name;
		if (this.guestMode) return;
		await updateRollSession(this.currentSessionId, fields);
	}

	load(record: SessionRecord) {
		this.currentSessionId = record.id;
		this.currentSessionRolls = record.rolls as RollResult[];
		this.currentSessionName = record.name;
		this.rolledAt = record.rolledAt;
		this.saveError = null;
	}

	reset() {
		this.currentSessionId = null;
		this.currentSessionRolls = [];
		this.currentSessionName = '';
		this.rolledAt = null;
		this.saveError = null;
	}
}

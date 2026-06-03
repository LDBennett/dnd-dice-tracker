import { submitRollSession, updateRollSession } from '../api/sessionApi';
import type { RollResult } from '../types/session.types';
import { SvelteDate } from 'svelte/reactivity';

export class Session {
	currentSessionId = $state<string | null>(null);
	currentSessionRolls = $state<RollResult[]>([]);
	currentSessionName = $state('');
	rolledAt = $state<string | null>(null);
	saving = $state(false);
	saveError = $state<string | null>(null);

	async autoSave(rolls: RollResult[]) {
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
			this.saveError = e instanceof Error ? e.message : 'Network error';
		} finally {
			this.saving = false;
		}
	}

	async patch(fields: { name?: string; rolls?: RollResult[] }) {
		if (!this.currentSessionId) return;
		if (fields.rolls !== undefined) this.currentSessionRolls = fields.rolls;
		if (fields.name !== undefined) this.currentSessionName = fields.name;
		await updateRollSession(this.currentSessionId, fields);
	}

	reset() {
		this.currentSessionId = null;
		this.currentSessionRolls = [];
		this.currentSessionName = '';
		this.rolledAt = null;
		this.saveError = null;
	}
}

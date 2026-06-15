import type { RollRecord,SessionRecord } from '@fe-shared';
import { untrack } from 'svelte';

export class SessionCardState {
	name = $state('');
	rolls = $state<RollRecord[]>([]);
	editingIndex = $state<number | null>(null);
	confirmingDelete = $state(false);

	constructor(session: SessionRecord) {
		this.name = untrack(() => session.name);
		this.rolls = untrack(() => session.rolls.map((r) => ({ ...r })));
	}

	handleEditConfirm(
		index: number,
		value: number,
		sessionId: string,
		onSaveRolls: (id: string, rolls: RollRecord[]) => void
	) {
		this.rolls[index].value = value;
		this.editingIndex = null;
		onSaveRolls(sessionId, this.rolls);
	}

	deleteRoll(
		index: number,
		sessionId: string,
		onSaveRolls: (id: string, rolls: RollRecord[]) => void,
		onDelete: (id: string) => void
	) {
		const updated = this.rolls.filter((_, i) => i !== index);
		if (updated.length === 0) onDelete(sessionId);
		else onSaveRolls(sessionId, updated);
	}
}

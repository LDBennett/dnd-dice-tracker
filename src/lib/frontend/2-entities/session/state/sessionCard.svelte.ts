import type { DieType, RollRecord, SessionRecord } from '@fe-shared';
import { untrack } from 'svelte';

export class SessionCardState {
	sessionId = $state('');
	name = $state('');
	rolls = $state<RollRecord[]>([]);
	editingIndex = $state<number | null>(null);
	confirmingDelete = $state(false);

	addingRoll = $state(false);
	addRollDie = $state<DieType>(20);
	addRollValue = $state(1);
	addRollNote = $state('');

	constructor(session: SessionRecord) {
		this.sessionId = untrack(() => session.id);
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

	submitAddRoll(sessionId: string, onSaveRolls: (id: string, rolls: RollRecord[]) => void) {
		const newRoll: RollRecord = {
			dieType: this.addRollDie,
			value: this.addRollValue,
			note: this.addRollNote.trim()
		};
		this.rolls = [...this.rolls, newRoll];
		onSaveRolls(sessionId, this.rolls);
		this.addingRoll = false;
		this.addRollDie = 20;
		this.addRollValue = 1;
		this.addRollNote = '';
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

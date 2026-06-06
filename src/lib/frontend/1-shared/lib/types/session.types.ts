import type { DieType } from './api-types';

export interface RollResult {
	dieType: DieType;
	value: number;
	note: string;
}

export interface ISession {
	currentSessionId: string | null;
	currentSessionRolls: RollResult[];
	currentSessionName: string;
	rolledAt: string | null;
	saving: boolean;
	saveError: string | null;
	autoSave(rolls: RollResult[]): Promise<void>;
	patch(fields: { name?: string; rolls?: RollResult[] }): Promise<void>;
	reset(): void;
}

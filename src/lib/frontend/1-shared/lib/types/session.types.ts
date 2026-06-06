export interface RollResult {
	dieType: 4 | 6 | 8 | 10 | 12 | 20 | 100;
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

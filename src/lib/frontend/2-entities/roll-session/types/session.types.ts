export interface RollResult {
	dieType: 4 | 6 | 8 | 10 | 12 | 20 | 100;
	value: number;
	note: string;
}

export interface SubmitResult {
	sessionId: string;
	rolls: RollResult[];
	total: number;
}

export interface RollRecord {
	dieType: number;
	value: number;
}

export interface SessionRecord {
	id: string;
	name: string;
	rolledAt: string;
	rolls: RollRecord[];
}

export interface BreakdownEntry {
	dieType: number;
	count: number;
	avg: number;
}

export interface SessionLuck {
	id: string;
	name: string;
	rolledAt: string;
	luck: number;
}

export interface SessionSummary {
	dice: Array<{ dieType: number; count: number; sum: number }>;
	totalSum: number;
	avg: number;
	rollCount: number;
}

export interface ExtendedStats {
	sessionCount: number;
	favDie: number | null;
	breakdown: BreakdownEntry[];
	sessionLucks: SessionLuck[];
	avgLuckPerSession: number;
}

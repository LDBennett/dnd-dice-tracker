export type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export interface SelectOption {
	value: string;
	label: string;
	subtext?: string;
}

export interface RollRecord {
	dieType: number;
	value: number;
	note: string;
}

export interface SessionRecord {
	id: string;
	name: string;
	rolledAt: string;
	modifier: number;
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
	topDice: number[];
	breakdown: BreakdownEntry[];
	sessionLucks: SessionLuck[];
	avgLuckPerSession: number;
}

export interface SingleSessionStats {
	totalRolls: number;
	nat20s: number;
	nat1s: number;
	bestRolls: Array<{ dieType: number; value: number }>;
	luck: number | null;
	breakdown: BreakdownEntry[];
}

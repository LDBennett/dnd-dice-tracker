export interface DiceResult {
	dieType: 4 | 6 | 8 | 10 | 12 | 20 | 100;
	value: number;
	note: string;
}

export class RollSession {
	private constructor(
		public readonly id: string,
		public readonly userId: string,
		private rolls: DiceResult[],
		private modifier: number,
		public readonly rolledAt: Date,
		private name: string
	) {}

	public static createNew(userId: string, modifier = 0, name = ''): RollSession {
		return new RollSession(crypto.randomUUID(), userId, [], modifier, new Date(), name);
	}

	public addDieRoll(dieType: DiceResult['dieType'], value: number, note = ''): void {
		this.rolls.push({ dieType, value, note });
	}

	public getRolls(): readonly DiceResult[] {
		return Object.freeze([...this.rolls]);
	}

	public getModifier(): number {
		return this.modifier;
	}

	public getName(): string {
		return this.name;
	}

	public get totalScore(): number {
		return this.rolls.reduce((sum, roll) => sum + roll.value, 0) + this.modifier;
	}
}

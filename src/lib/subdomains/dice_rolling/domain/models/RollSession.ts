export type DiceResult = {
	dieType: 4 | 6 | 8 | 10 | 12 | 20 | 100;
	value: number;
	note: string;
};

const VALID_DIE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;

export class DiceResultVO {
	private constructor(
		public readonly dieType: DiceResult['dieType'],
		public readonly value: number,
		public readonly note: string
	) {}

	static create(dieType: number, value: number, note = ''): DiceResultVO {
		if (!(VALID_DIE_TYPES as readonly number[]).includes(dieType))
			throw new Error(`Invalid die type: ${dieType}. Must be one of ${VALID_DIE_TYPES.join(', ')}`);
		if (!Number.isInteger(value) || value < 1 || value > dieType)
			throw new Error(`Value ${value} out of range for d${dieType} (must be 1–${dieType})`);
		return new DiceResultVO(dieType as DiceResult['dieType'], value, note.trim());
	}

	toPlain(): DiceResult {
		return { dieType: this.dieType, value: this.value, note: this.note };
	}
}

export class RollSession {
	private constructor(
		public readonly id: string,
		public readonly userId: string,
		private rolls: DiceResultVO[],
		private modifier: number,
		public readonly rolledAt: Date,
		private name: string
	) {}

	public static createNew(userId: string, modifier = 0, name = ''): RollSession {
		return new RollSession(crypto.randomUUID(), userId, [], modifier, new Date(), name);
	}

	public addDieRoll(dieType: DiceResult['dieType'], value: number, note = ''): void {
		this.rolls.push(DiceResultVO.create(dieType, value, note));
	}

	public getRolls(): readonly DiceResultVO[] {
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

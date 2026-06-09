export class PlayerStats {
	constructor(
		public readonly userId: string,
		private _totalRollsCount: number,
		private _runningSum: number,
		private _naturalTwenties: number,
		private _naturalOnes: number
	) {}

	public get totalRollsCount(): number {
		return this._totalRollsCount;
	}
	public get runningSum(): number {
		return this._runningSum;
	}
	public get naturalTwenties(): number {
		return this._naturalTwenties;
	}
	public get naturalOnes(): number {
		return this._naturalOnes;
	}

	public recordRoll(dieType: number, value: number): void {
		this._totalRollsCount += 1;
		this._runningSum += value;

		if (dieType === 20) {
			if (value === 20) this._naturalTwenties += 1;
			if (value === 1) this._naturalOnes += 1;
		}
	}

	public removeRoll(dieType: number, value: number): void {
		this._totalRollsCount -= 1;
		this._runningSum -= value;

		if (dieType === 20) {
			if (value === 20) this._naturalTwenties -= 1;
			if (value === 1) this._naturalOnes -= 1;
		}
	}

	public get averageRoll(): number {
		if (this._totalRollsCount === 0) return 0;
		return Number((this._runningSum / this._totalRollsCount).toFixed(2));
	}
}

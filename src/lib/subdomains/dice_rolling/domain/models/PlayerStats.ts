export class PlayerStats {
	constructor(
		public readonly userId: string,
		public totalRollsCount: number,
		public runningSum: number,
		public naturalTwenties: number,
		public naturalOnes: number
	) {}

	public recordRoll(dieType: number, value: number): void {
		this.totalRollsCount += 1;
		this.runningSum += value;

		if (dieType === 20) {
			if (value === 20) this.naturalTwenties += 1;
			if (value === 1) this.naturalOnes += 1;
		}
	}

	public get averageRoll(): number {
		if (this.totalRollsCount === 0) return 0;
		return Number((this.runningSum / this.totalRollsCount).toFixed(2));
	}
}

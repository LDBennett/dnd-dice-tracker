import { describe, expect, it } from 'vitest';

import { PlayerStats } from './PlayerStats';

function makeStats(totalRolls = 0, runningSum = 0, nat20s = 0, nat1s = 0) {
	return new PlayerStats('user-1', totalRolls, runningSum, nat20s, nat1s);
}

describe('PlayerStats', () => {
	describe('recordRoll', () => {
		it('increments totalRollsCount', () => {
			const stats = makeStats();
			stats.recordRoll(20, 15);
			expect(stats.totalRollsCount).toBe(1);
		});

		it('adds value to runningSum', () => {
			const stats = makeStats();
			stats.recordRoll(6, 4);
			expect(stats.runningSum).toBe(4);
		});

		it('accumulates multiple rolls', () => {
			const stats = makeStats();
			stats.recordRoll(6, 3);
			stats.recordRoll(6, 5);
			expect(stats.totalRollsCount).toBe(2);
			expect(stats.runningSum).toBe(8);
		});

		it('counts a nat-20 on a d20', () => {
			const stats = makeStats();
			stats.recordRoll(20, 20);
			expect(stats.naturalTwenties).toBe(1);
			expect(stats.naturalOnes).toBe(0);
		});

		it('counts a nat-1 on a d20', () => {
			const stats = makeStats();
			stats.recordRoll(20, 1);
			expect(stats.naturalOnes).toBe(1);
			expect(stats.naturalTwenties).toBe(0);
		});

		it('does not count nat-20 or nat-1 on non-d20 dice', () => {
			const stats = makeStats();
			stats.recordRoll(6, 1);
			stats.recordRoll(6, 6);
			stats.recordRoll(12, 12);
			expect(stats.naturalOnes).toBe(0);
			expect(stats.naturalTwenties).toBe(0);
		});
	});

	describe('removeRoll', () => {
		it('decrements totalRollsCount and runningSum', () => {
			const stats = makeStats(3, 30, 0, 0);
			stats.removeRoll(6, 10);
			expect(stats.totalRollsCount).toBe(2);
			expect(stats.runningSum).toBe(20);
		});

		it('decrements naturalTwenties when removing a d20 nat-20', () => {
			const stats = makeStats(1, 20, 1, 0);
			stats.removeRoll(20, 20);
			expect(stats.naturalTwenties).toBe(0);
		});

		it('decrements naturalOnes when removing a d20 nat-1', () => {
			const stats = makeStats(1, 1, 0, 1);
			stats.removeRoll(20, 1);
			expect(stats.naturalOnes).toBe(0);
		});

		it('does not touch nat counters when removing a non-d20 roll', () => {
			const stats = makeStats(2, 7, 1, 1);
			stats.removeRoll(8, 6);
			expect(stats.naturalTwenties).toBe(1);
			expect(stats.naturalOnes).toBe(1);
		});
	});

	describe('averageRoll', () => {
		it('returns 0 when no rolls have been recorded', () => {
			expect(makeStats().averageRoll).toBe(0);
		});

		it('returns the correct average', () => {
			const stats = makeStats();
			stats.recordRoll(6, 3);
			stats.recordRoll(6, 5);
			expect(stats.averageRoll).toBe(4);
		});

		it('rounds to 2 decimal places', () => {
			const stats = makeStats();
			stats.recordRoll(6, 1);
			stats.recordRoll(6, 2);
			stats.recordRoll(6, 3);
			// 6 / 3 = 2.00, but test a non-integer case:
			stats.recordRoll(6, 2);
			// sum=8, count=4 → 2.00, add one more to get non-integer
			stats.recordRoll(6, 1);
			// sum=9, count=5 → 1.80
			expect(stats.averageRoll).toBe(1.8);
		});

		it('truncates to 2 decimal places on repeating decimals', () => {
			const stats = makeStats(0, 0, 0, 0);
			stats.recordRoll(6, 1);
			stats.recordRoll(6, 1);
			stats.recordRoll(6, 2);
			// sum=4, count=3 → 1.33
			expect(stats.averageRoll).toBe(1.33);
		});
	});
});

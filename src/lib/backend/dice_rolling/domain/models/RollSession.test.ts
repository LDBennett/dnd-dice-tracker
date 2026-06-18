import { describe, expect, it } from 'vitest';

import { DiceResultVO, RollSession } from './RollSession';

describe('DiceResultVO', () => {
	describe('create', () => {
		it('creates a valid result', () => {
			const result = DiceResultVO.create(20, 15, 'constitution');
			expect(result.dieType).toBe(20);
			expect(result.value).toBe(15);
			expect(result.note).toBe('constitution');
		});

		it('trims whitespace from note', () => {
			const result = DiceResultVO.create(6, 3, '  performance  ');
			expect(result.note).toBe('performance');
		});

		it('defaults note to empty string', () => {
			const result = DiceResultVO.create(6, 3);
			expect(result.note).toBe('');
		});

		it('throws on an invalid die type', () => {
			expect(() => DiceResultVO.create(7, 3)).toThrow('Invalid die type: 7');
		});

		it('throws when value is below 1', () => {
			expect(() => DiceResultVO.create(6, 0)).toThrow('out of range');
		});

		it('throws when value exceeds the die type', () => {
			expect(() => DiceResultVO.create(6, 7)).toThrow('out of range');
		});

		it('throws when value is not an integer', () => {
			expect(() => DiceResultVO.create(6, 3.5)).toThrow('out of range');
		});

		it('accepts boundary values (1 and max face)', () => {
			expect(() => DiceResultVO.create(12, 1)).not.toThrow();
			expect(() => DiceResultVO.create(12, 12)).not.toThrow();
		});

		it('accepts all valid die types', () => {
			for (const dieType of [4, 6, 8, 10, 12, 20, 100] as const) {
				expect(() => DiceResultVO.create(dieType, 1)).not.toThrow();
			}
		});
	});

	describe('toPlain', () => {
		it('returns a plain object with the same values', () => {
			const result = DiceResultVO.create(20, 20, 'crit');
			expect(result.toPlain()).toEqual({ dieType: 20, value: 20, note: 'crit' });
		});
	});
});

describe('RollSession', () => {
	describe('createNew', () => {
		it('starts with an empty rolls array', () => {
			const session = RollSession.createNew('user-1');
			expect(session.getRolls()).toHaveLength(0);
		});

		it('defaults modifier to 0', () => {
			const session = RollSession.createNew('user-1');
			expect(session.getModifier()).toBe(0);
		});

		it('applies a provided modifier', () => {
			const session = RollSession.createNew('user-1', 5);
			expect(session.getModifier()).toBe(5);
		});

		it('defaults name to empty string', () => {
			const session = RollSession.createNew('user-1');
			expect(session.getName()).toBe('');
		});

		it('assigns a unique id each time', () => {
			const a = RollSession.createNew('user-1');
			const b = RollSession.createNew('user-1');
			expect(a.id).not.toBe(b.id);
		});
	});

	describe('addDieRoll', () => {
		it('appends a roll', () => {
			const session = RollSession.createNew('user-1');
			session.addDieRoll(20, 15, 'attack');
			expect(session.getRolls()).toHaveLength(1);
			expect(session.getRolls()[0].value).toBe(15);
		});

		it('accumulates multiple rolls', () => {
			const session = RollSession.createNew('user-1');
			session.addDieRoll(6, 3);
			session.addDieRoll(6, 5);
			expect(session.getRolls()).toHaveLength(2);
		});

		it('throws on an invalid roll via DiceResultVO', () => {
			const session = RollSession.createNew('user-1');
			expect(() => session.addDieRoll(6, 99)).toThrow('out of range');
		});
	});

	describe('getRolls', () => {
		it('returns a frozen array (cannot be mutated externally)', () => {
			const session = RollSession.createNew('user-1');
			session.addDieRoll(6, 3);
			const rolls = session.getRolls() as DiceResultVO[];
			expect(() => rolls.push(DiceResultVO.create(6, 1))).toThrow();
		});
	});

	describe('totalScore', () => {
		it('is 0 with no rolls and no modifier', () => {
			expect(RollSession.createNew('user-1').totalScore).toBe(0);
		});

		it('equals the modifier when there are no rolls', () => {
			expect(RollSession.createNew('user-1', 3).totalScore).toBe(3);
		});

		it('sums all roll values plus modifier', () => {
			const session = RollSession.createNew('user-1', 2);
			session.addDieRoll(6, 4);
			session.addDieRoll(8, 6);
			expect(session.totalScore).toBe(12); // 4 + 6 + 2
		});

		it('works with a negative modifier', () => {
			const session = RollSession.createNew('user-1', -3);
			session.addDieRoll(6, 5);
			expect(session.totalScore).toBe(2);
		});
	});
});

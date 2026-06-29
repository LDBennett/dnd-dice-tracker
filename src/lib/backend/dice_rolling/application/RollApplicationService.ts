import { db } from '$lib/server/db';

import { PlayerStats } from '../domain/models/PlayerStats';
import type { DiceResult } from '../domain/models/RollSession';
import { RollSession } from '../domain/models/RollSession';
import type { RollRecord } from '../infrastructure/repositories/PostgresRollRepository';
import { PostgresRollRepository } from '../infrastructure/repositories/PostgresRollRepository';
import { PostgresStatsRepository } from '../infrastructure/repositories/PostgresStatsRepository';

const statsRepo = new PostgresStatsRepository();
const rollRepo = new PostgresRollRepository();

export class RollApplicationService {
	async executeRoll(
		userId: string,
		dice: Array<{ dieType: DiceResult['dieType']; value: number; note?: string }>,
		modifier: number,
		name = ''
	) {
		const session = RollSession.createNew(userId, modifier, name);
		for (const die of dice) {
			session.addDieRoll(die.dieType, die.value, die.note ?? '');
		}

		const stats = await statsRepo.findByUserId(userId);
		for (const roll of session.getRolls()) {
			stats.recordRoll(roll.dieType, roll.value);
		}

		await db.transaction(async (tx) => {
			await rollRepo.save(session, tx);
			await statsRepo.save(stats, tx);
		});

		return { sessionId: session.id, total: session.totalScore, rolls: session.getRolls() };
	}

	async appendRollsToSession(
		sessionId: string,
		userId: string,
		dice: Array<{ dieType: DiceResult['dieType']; value: number; note?: string }>,
		modifier = 0
	) {
		const existing = await rollRepo.findById(sessionId, userId);
		if (!existing) throw new Error('Session not found');

		const newRolls: RollRecord[] = dice.map((d) => ({
			dieType: d.dieType,
			value: d.value,
			note: d.note ?? ''
		}));

		const stats = await statsRepo.findByUserId(userId);
		for (const roll of newRolls) {
			stats.recordRoll(roll.dieType, roll.value);
		}

		await db.transaction(async (tx) => {
			await rollRepo.updateSession(
				sessionId,
				userId,
				{ rolls: [...existing.rolls, ...newRolls] },
				tx
			);
			await statsRepo.save(stats, tx);
		});

		return {
			sessionId,
			total: newRolls.reduce((s, r) => s + r.value, 0) + modifier,
			rolls: newRolls
		};
	}

	async getPlayerDashboard(userId: string) {
		const stats = await statsRepo.findByUserId(userId);
		return {
			totalRolls: stats.totalRollsCount,
			averageValue: stats.averageRoll,
			nat20s: stats.naturalTwenties,
			nat1s: stats.naturalOnes
		};
	}

	async getLatestSession(userId: string) {
		const session = await rollRepo.findLatestByUserId(userId);
		if (!session) return null;
		return { ...session, rolls: [...session.rolls].reverse() };
	}

	async getSessionHistory(userId: string) {
		return rollRepo.findByUserId(userId);
	}

	async getAllSessions() {
		return rollRepo.findAll();
	}

	async getPublicDashboard() {
		const stats = await statsRepo.getAggregate();
		return {
			totalRolls: stats.totalRollsCount,
			averageValue: stats.averageRoll,
			nat20s: stats.naturalTwenties,
			nat1s: stats.naturalOnes
		};
	}

	async updateSession(
		sessionId: string,
		userId: string,
		fields: { name?: string; rolls?: RollRecord[] }
	) {
		if (fields.rolls !== undefined) {
			const existing = await rollRepo.findById(sessionId, userId);
			if (existing) {
				const stats = await statsRepo.findByUserId(userId);
				for (const roll of existing.rolls) {
					stats.removeRoll(roll.dieType, roll.value);
				}
				for (const roll of fields.rolls) {
					stats.recordRoll(roll.dieType, roll.value);
				}
				await db.transaction(async (tx) => {
					await rollRepo.updateSession(sessionId, userId, fields, tx);
					await statsRepo.save(stats, tx);
				});
				return;
			}
		}
		await rollRepo.updateSession(sessionId, userId, fields);
	}

	async deleteSession(sessionId: string, userId: string): Promise<void> {
		const session = await rollRepo.findById(sessionId, userId);
		if (!session) return;

		const stats = await statsRepo.findByUserId(userId);
		for (const roll of session.rolls) {
			stats.removeRoll(roll.dieType, roll.value);
		}

		await db.transaction(async (tx) => {
			await rollRepo.deleteSession(sessionId, userId, tx);
			await statsRepo.save(stats, tx);
		});
	}

	async recalculateStats(userId: string): Promise<void> {
		const sessions = await rollRepo.findByUserId(userId);
		const stats = new PlayerStats(userId, 0, 0, 0, 0);
		for (const session of sessions) {
			for (const roll of session.rolls) {
				stats.recordRoll(roll.dieType, roll.value);
			}
		}
		await statsRepo.save(stats);
	}
}

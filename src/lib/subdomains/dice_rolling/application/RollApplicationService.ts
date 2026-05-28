import { RollSession } from '../domain/models/RollSession';
import { PostgresStatsRepository } from '../infrastructure/repositories/PostgresStatsRepository';
import { PostgresRollRepository } from '../infrastructure/repositories/PostgresRollRepository';
import type { DiceResult } from '../domain/models/RollSession';
import type { RollRecord } from '../infrastructure/repositories/PostgresRollRepository';

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

		// TODO: wrap in db.transaction for atomicity
		await rollRepo.save(session);
		await statsRepo.save(stats);

		return { sessionId: session.id, total: session.totalScore, rolls: session.getRolls() };
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

	async updateSession(sessionId: string, userId: string, fields: { name?: string; rolls?: RollRecord[] }) {
		await rollRepo.updateSession(sessionId, userId, fields);
	}
}

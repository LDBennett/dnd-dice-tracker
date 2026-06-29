import { eq } from 'drizzle-orm';

import { db, type Tx } from '$lib/server/db';
import { dbPlayerStats } from '$lib/server/db/schema';

import { PlayerStats } from '../../domain/models/PlayerStats';

const ZERO = { totalRollsCount: 0, runningSum: 0, naturalTwenties: 0, naturalOnes: 0 } as const;

export class PostgresStatsRepository {
	async findByUserId(userId: string): Promise<PlayerStats> {
		const [dbStats] = await db
			.select()
			.from(dbPlayerStats)
			.where(eq(dbPlayerStats.userId, userId))
			.limit(1);

		if (!dbStats) {
			return new PlayerStats(userId, 0, 0, 0, 0);
		}

		return new PlayerStats(
			dbStats.userId,
			dbStats.totalRollsCount,
			dbStats.runningSum,
			dbStats.naturalTwenties,
			dbStats.naturalOnes
		);
	}

	async save(stats: PlayerStats, tx?: Tx): Promise<void> {
		await (tx ?? db)
			.insert(dbPlayerStats)
			.values({
				userId: stats.userId,
				totalRollsCount: stats.totalRollsCount,
				runningSum: stats.runningSum,
				naturalTwenties: stats.naturalTwenties,
				naturalOnes: stats.naturalOnes
			})
			.onConflictDoUpdate({
				target: dbPlayerStats.userId,
				set: {
					totalRollsCount: stats.totalRollsCount,
					runningSum: stats.runningSum,
					naturalTwenties: stats.naturalTwenties,
					naturalOnes: stats.naturalOnes
				}
			});
	}

	async getAggregate(): Promise<PlayerStats> {
		const rows = await db.select().from(dbPlayerStats);
		if (rows.length === 0) return new PlayerStats('public', 0, 0, 0, 0);
		type Totals = {
			totalRollsCount: number;
			runningSum: number;
			naturalTwenties: number;
			naturalOnes: number;
		};
		const t = rows.reduce<Totals>(
			(acc, r) => ({
				totalRollsCount: acc.totalRollsCount + r.totalRollsCount,
				runningSum: acc.runningSum + r.runningSum,
				naturalTwenties: acc.naturalTwenties + r.naturalTwenties,
				naturalOnes: acc.naturalOnes + r.naturalOnes
			}),
			{ ...ZERO }
		);
		return new PlayerStats(
			'public',
			t.totalRollsCount,
			t.runningSum,
			t.naturalTwenties,
			t.naturalOnes
		);
	}
}

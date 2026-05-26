import { db } from '$lib/server/db';
import { dbPlayerStats } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { PlayerStats } from '../../domain/models/PlayerStats';

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
}

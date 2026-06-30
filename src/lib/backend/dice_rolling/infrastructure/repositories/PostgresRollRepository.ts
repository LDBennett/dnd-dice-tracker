import { and, desc, eq } from 'drizzle-orm';

import { db, type Tx } from '$lib/server/db';
import { dbRollSessions } from '$lib/server/db/schema';

import type { RollSession } from '../../domain/models/RollSession';

export interface RollRecord {
	dieType: number;
	value: number;
	note: string;
}

export interface SessionRecord {
	id: string;
	rolls: RollRecord[];
	modifier: number;
	rolledAt: Date;
	name: string;
	total: number;
}

export class PostgresRollRepository {
	private mapRows(rows: (typeof dbRollSessions.$inferSelect)[]): SessionRecord[] {
		return rows.map((row) => {
			const rolls = (row.rolls as RollRecord[]).map((r) => ({
				dieType: r.dieType,
				value: r.value,
				note: r.note ?? ''
			}));
			return {
				id: row.id,
				rolls,
				modifier: row.modifier,
				rolledAt: row.rolledAt,
				name: row.name,
				total: rolls.reduce((s, r) => s + r.value, 0) + row.modifier
			};
		});
	}

	async save(session: RollSession, tx?: Tx): Promise<void> {
		await (tx ?? db).insert(dbRollSessions).values({
			id: session.id,
			userId: session.userId,
			rolls: session.getRolls() as unknown as object,
			modifier: session.getModifier(),
			name: session.getName(),
			rolledAt: session.rolledAt
		});
	}

	async findByUserId(userId: string): Promise<SessionRecord[]> {
		const rows = await db
			.select()
			.from(dbRollSessions)
			.where(eq(dbRollSessions.userId, userId))
			.orderBy(desc(dbRollSessions.rolledAt))
			.limit(100);
		return this.mapRows(rows);
	}

	async findLatestByUserId(userId: string): Promise<SessionRecord | null> {
		const rows = await db
			.select()
			.from(dbRollSessions)
			.where(eq(dbRollSessions.userId, userId))
			.orderBy(desc(dbRollSessions.rolledAt))
			.limit(1);
		return this.mapRows(rows)[0] ?? null;
	}

	async findAll(): Promise<SessionRecord[]> {
		const rows = await db
			.select()
			.from(dbRollSessions)
			.orderBy(desc(dbRollSessions.rolledAt))
			.limit(100);
		return this.mapRows(rows);
	}

	async findById(id: string, userId: string): Promise<SessionRecord | null> {
		const rows = await db
			.select()
			.from(dbRollSessions)
			.where(and(eq(dbRollSessions.id, id), eq(dbRollSessions.userId, userId)))
			.limit(1);
		const mapped = this.mapRows(rows);
		return mapped[0] ?? null;
	}

	async updateSession(
		sessionId: string,
		userId: string,
		fields: { name?: string; rolls?: RollRecord[]; rolledAt?: Date },
		tx?: Tx
	): Promise<void> {
		const update: Record<string, unknown> = {};
		if (fields.name !== undefined) update.name = fields.name;
		if (fields.rolls !== undefined) update.rolls = fields.rolls;
		if (fields.rolledAt !== undefined) update.rolledAt = fields.rolledAt;

		await (tx ?? db)
			.update(dbRollSessions)
			.set(update)
			.where(and(eq(dbRollSessions.id, sessionId), eq(dbRollSessions.userId, userId)));
	}

	async deleteSession(sessionId: string, userId: string, tx?: Tx): Promise<void> {
		await (tx ?? db)
			.delete(dbRollSessions)
			.where(and(eq(dbRollSessions.id, sessionId), eq(dbRollSessions.userId, userId)));
	}
}

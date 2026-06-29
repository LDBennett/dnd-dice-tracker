import { integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const dbRollSessions = pgTable('db_roll_sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	rolls: jsonb('rolls').notNull(),
	modifier: integer('modifier').notNull(),
	name: text('name').notNull().default(''),
	rolledAt: timestamp('rolled_at').defaultNow().notNull()
});

export const dbPlayerStats = pgTable('db_player_stats', {
	userId: text('user_id').primaryKey(),
	totalRollsCount: integer('total_rolls_count').default(0).notNull(),
	runningSum: integer('running_sum').default(0).notNull(),
	naturalTwenties: integer('natural_twenties').default(0).notNull(),
	naturalOnes: integer('natural_ones').default(0).notNull()
});

export * from './auth.schema';

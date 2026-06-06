import type { BreakdownEntry, ExtendedStats, SessionLuck, SessionRecord, SessionSummary, SingleSessionStats } from '../types/api-types';

export function computeExtended(sessions: SessionRecord[]): ExtendedStats {
	const counts: Partial<Record<number, { count: number; sum: number }>> = {};
	for (const s of sessions) {
		for (const r of s.rolls) {
			const d = counts[r.dieType] ?? { count: 0, sum: 0 };
			counts[r.dieType] = { count: d.count + 1, sum: d.sum + r.value };
		}
	}

	const breakdown: BreakdownEntry[] = Object.entries(counts)
		.map(([dt, st]) => ({
			dieType: Number(dt),
			count: st!.count,
			avg: Number((st!.sum / st!.count).toFixed(2))
		}))
		.sort((a, b) => a.dieType - b.dieType);

	const topDice = [...breakdown]
		.sort((a, b) => b.count - a.count)
		.slice(0, 3)
		.map((e) => e.dieType);

	const sessionLucks: SessionLuck[] = sessions
		.filter((s) => s.rolls.length > 0)
		.map((s) => {
			const total = s.rolls.reduce((acc, r) => acc + r.value - (r.dieType + 1) / 2, 0);
			return {
				id: s.id,
				name: s.name,
				rolledAt: s.rolledAt,
				luck: Number((total / s.rolls.length).toFixed(2))
			};
		});

	const avgLuckPerSession =
		sessionLucks.length > 0
			? Number((sessionLucks.reduce((s, l) => s + l.luck, 0) / sessionLucks.length).toFixed(2))
			: 0;

	return {
		sessionCount: sessions.length,
		topDice,
		breakdown,
		sessionLucks,
		avgLuckPerSession
	};
}

export function sessionSummary(sessions: SessionRecord[], id: string): SessionSummary | null {
	const s = sessions.find((s) => s.id === id);
	if (!s) return null;

	const dieCounts: Partial<Record<number, { count: number; sum: number }>> = {};
	for (const r of s.rolls) {
		const d = dieCounts[r.dieType] ?? { count: 0, sum: 0 };
		dieCounts[r.dieType] = { count: d.count + 1, sum: d.sum + r.value };
	}

	const dice = Object.entries(dieCounts)
		.map(([dt, stat]) => ({ dieType: Number(dt), count: stat!.count, sum: stat!.sum }))
		.sort((a, b) => a.dieType - b.dieType);

	const totalSum = s.rolls.reduce((acc, r) => acc + r.value, 0);
	const avg = s.rolls.length > 0 ? Number((totalSum / s.rolls.length).toFixed(2)) : 0;

	return { dice, totalSum, avg, rollCount: s.rolls.length };
}

export function singleSessionStats(session: SessionRecord): SingleSessionStats {
	const counts: Partial<Record<number, { count: number; sum: number }>> = {};
	let nat20s = 0;
	let nat1s = 0;
	let luckDelta = 0;

	for (const r of session.rolls) {
		const d = counts[r.dieType] ?? { count: 0, sum: 0 };
		counts[r.dieType] = { count: d.count + 1, sum: d.sum + r.value };
		if (r.dieType === 20) {
			if (r.value === 20) nat20s++;
			if (r.value === 1) nat1s++;
		}
		luckDelta += r.value - (r.dieType + 1) / 2;
	}

	const breakdown: BreakdownEntry[] = Object.entries(counts)
		.map(([dt, st]) => ({
			dieType: Number(dt),
			count: st!.count,
			avg: Number((st!.sum / st!.count).toFixed(2))
		}))
		.sort((a, b) => a.dieType - b.dieType);

	const topDice = [...breakdown]
		.sort((a, b) => b.count - a.count)
		.slice(0, 3)
		.map((e) => e.dieType);

	const totalRolls = session.rolls.length;
	const luck = totalRolls > 0 ? Number((luckDelta / totalRolls).toFixed(2)) : null;

	return { totalRolls, nat20s, nat1s, topDice, luck, breakdown };
}

export function fmtLuck(n: number): string {
	return (n >= 0 ? '+' : '') + n.toFixed(2);
}

export function luckClass(n: number): string {
	return n > 0.1 ? 'text-green-400' : n < -0.1 ? 'text-red-400' : 'text-stone-500';
}

export function fmtDate(iso: string): string {
	return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function fmtTime(iso: string): string {
	return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

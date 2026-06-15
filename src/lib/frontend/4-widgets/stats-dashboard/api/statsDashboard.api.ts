import type { SessionRecord } from '@fe-shared';

export interface DashboardData {
	totalRolls: number;
	nat20s: number;
	nat1s: number;
}

export async function fetchRollSessions(): Promise<SessionRecord[]> {
	const res = await fetch('/api/rolls');
	if (!res.ok) throw new Error(`Failed to fetch rolls: ${res.status}`);
	return res.json();
}

export async function fetchDashboard(): Promise<DashboardData> {
	const res = await fetch('/api/dashboard');
	if (!res.ok) throw new Error(`Failed to fetch dashboard: ${res.status}`);
	return res.json();
}

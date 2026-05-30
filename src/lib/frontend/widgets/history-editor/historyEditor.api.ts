export interface RollRecord { dieType: number; value: number; note: string; }

export interface Session {
	id: string;
	rolls: RollRecord[];
	modifier: number;
	rolledAt: string;
	name: string;
	total: number;
}

export async function fetchSessions(): Promise<Session[]> {
	const res = await fetch('/api/rolls');
	if (!res.ok) return [];
	return res.json();
}

export async function patchSession(id: string, body: object): Promise<void> {
	await fetch(`/api/rolls/${id}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

export async function deleteSession(id: string): Promise<void> {
	await fetch(`/api/rolls/${id}`, { method: 'DELETE' });
}

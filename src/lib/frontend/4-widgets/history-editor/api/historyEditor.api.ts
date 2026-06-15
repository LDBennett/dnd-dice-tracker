import type { SessionRecord } from '@fe-shared';

export async function fetchSessions(): Promise<SessionRecord[]> {
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

import type { SessionRecord } from '@fe-shared/lib';

import type { RollResult, SubmitResult } from '../types/session.types';
export type { RollResult, SubmitResult };

export async function submitRollSession(
	rolls: RollResult[],
	sessionName: string,
	sessionId?: string
): Promise<SubmitResult> {
	const res = await fetch('/api/roll', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ dice: rolls, name: sessionName, sessionId })
	});
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(`Save failed (${res.status}): ${text}`);
	}
	return res.json();
}

export async function fetchSessions(): Promise<SessionRecord[]> {
	const res = await fetch('/api/rolls');
	if (!res.ok) return [];
	return res.json();
}

export async function updateRollSession(
	sessionId: string,
	fields: { name?: string; rolls?: RollResult[] }
): Promise<void> {
	const res = await fetch(`/api/rolls/${sessionId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(fields)
	});
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(`Update failed (${res.status}): ${text}`);
	}
}

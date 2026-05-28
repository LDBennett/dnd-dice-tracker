export interface RollResult {
	dieType: 4 | 6 | 8 | 10 | 12 | 20 | 100;
	value: number;
	note: string;
}

export interface SubmitResult {
	rolls: RollResult[];
	total: number;
}

export async function submitRollSession(
	rolls: RollResult[],
	sessionName: string
): Promise<SubmitResult> {
	const res = await fetch('/api/roll', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ dice: rolls, name: sessionName })
	});
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(`Save failed (${res.status}): ${text}`);
	}
	return res.json();
}

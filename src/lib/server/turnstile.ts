import { TURNSTILE_SECRET_KEY } from '$env/static/private';

export async function verifyTurnstile(token: string | null, ip?: string): Promise<boolean> {
	if (!token) return false;
	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ secret: TURNSTILE_SECRET_KEY, response: token, remoteip: ip })
	});
	const data: { success: boolean } = await res.json();
	return data.success === true;
}

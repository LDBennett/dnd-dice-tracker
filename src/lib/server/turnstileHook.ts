import { json, type Handle } from '@sveltejs/kit';

import { verifyTurnstile } from './turnstile';

const TURNSTILE_ROUTES = ['/api/auth/sign-in/email', '/api/auth/sign-up/email'];

export const handleTurnstile: Handle = async ({ event, resolve }) => {
	if (event.request.method === 'POST' && TURNSTILE_ROUTES.includes(event.url.pathname)) {
		const token = event.request.headers.get('x-turnstile-token');
		if (!(await verifyTurnstile(token, event.getClientAddress()))) {
			return json({ message: 'Bot verification failed. Please try again.' }, { status: 400 });
		}
	}
	return resolve(event);
};

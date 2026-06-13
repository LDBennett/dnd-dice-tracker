import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { sveltekitCookies } from 'better-auth/svelte-kit';

import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';

type Auth = ReturnType<typeof betterAuth>;

const authCache = new Map<string, Auth>();

function createAuth(baseURL: string): Auth {
	return betterAuth({
		baseURL,
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(db, { provider: 'pg' }),
		emailAndPassword: { enabled: true },
		plugins: [sveltekitCookies(getRequestEvent)]
	});
}

export function getAuth(): Auth {
	const event = getRequestEvent();
	if (!event) throw new Error('Auth function must be called within a request context');
	const baseURL = event.url.origin;
	if (!authCache.has(baseURL)) {
		authCache.set(baseURL, createAuth(baseURL));
	}
	return authCache.get(baseURL)!;
}

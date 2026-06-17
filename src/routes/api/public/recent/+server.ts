import { json } from '@sveltejs/kit';

import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { RollApplicationService } from '$lib/backend/dice_rolling';

import type { RequestHandler } from './$types';

const rollService = new RollApplicationService();

const ALLOWED_ORIGINS = new Set([
	'https://ldbennett.com',
	'https://www.ldbennett.com',
	...(dev ? ['http://localhost:4321', 'http://localhost:5173'] : [])
]);

function buildCorsHeaders(origin: string | null) {
	const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://ldbennett.com';
	return {
		'Access-Control-Allow-Origin': allowed,
		'Access-Control-Allow-Methods': 'GET, OPTIONS'
	};
}

export const OPTIONS: RequestHandler = ({ request }) =>
	new Response(null, { status: 204, headers: buildCorsHeaders(request.headers.get('origin')) });

export const GET: RequestHandler = async ({ request }) => {
	const corsHeaders = buildCorsHeaders(request.headers.get('origin'));

	if (!env.WIDGET_USER_ID) {
		return new Response('Server misconfigured', { status: 500, headers: corsHeaders });
	}

	const session = await rollService.getLatestSession(env.WIDGET_USER_ID);

	return json({ recentSession: session }, { headers: corsHeaders });
};

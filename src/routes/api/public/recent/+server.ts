import { json } from '@sveltejs/kit';

import { env } from '$env/dynamic/private';
import { RollApplicationService } from '$lib/backend/dice_rolling';

import type { RequestHandler } from './$types';

const rollService = new RollApplicationService();

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

export const OPTIONS: RequestHandler = () =>
	new Response(null, { status: 204, headers: corsHeaders });

export const GET: RequestHandler = async () => {
	if (!env.WIDGET_USER_ID) {
		return new Response('Server misconfigured', { status: 500, headers: corsHeaders });
	}

	const session = await rollService.getLatestSession(env.WIDGET_USER_ID);

	return json({ recentSession: session }, { headers: corsHeaders });
};

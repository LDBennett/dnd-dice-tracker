import { json } from '@sveltejs/kit';

import { RollApplicationService } from '$lib/backend/dice_rolling';

import type { RequestHandler } from './$types';

const rollService = new RollApplicationService();

export const GET: RequestHandler = async ({ locals }) => {
	const sessions = locals.user
		? await rollService.getSessionHistory(locals.user.id)
		: await rollService.getAllSessions();
	return json(sessions);
};

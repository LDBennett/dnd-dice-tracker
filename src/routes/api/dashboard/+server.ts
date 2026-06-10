import { json } from '@sveltejs/kit';

import { RollApplicationService } from '$lib/backend/dice_rolling';

import type { RequestHandler } from './$types';

const rollService = new RollApplicationService();

export const GET: RequestHandler = async ({ locals }) => {
	const dashboard = locals.user
		? await rollService.getPlayerDashboard(locals.user.id)
		: await rollService.getPublicDashboard();
	return json(dashboard);
};

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RollApplicationService } from '$lib/subdomains/dice_rolling';

const rollService = new RollApplicationService();

export const GET: RequestHandler = async ({ locals }) => {
	const dashboard = locals.user
		? await rollService.getPlayerDashboard(locals.user.id)
		: await rollService.getPublicDashboard();
	return json(dashboard);
};

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RollApplicationService } from '$lib/subdomains/dice_rolling/application/RollApplicationService';

const rollService = new RollApplicationService();

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const dashboard = await rollService.getPlayerDashboard(locals.user.id);
	return json(dashboard);
};

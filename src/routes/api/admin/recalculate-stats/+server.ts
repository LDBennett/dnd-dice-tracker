import { error,json } from '@sveltejs/kit';

import { RollApplicationService } from '$lib/backend/dice_rolling/application/RollApplicationService';

import type { RequestHandler } from './$types';

const rollService = new RollApplicationService();

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) error(401, 'Unauthorized');
	await rollService.recalculateStats(locals.user.id);
	return json({ ok: true });
};

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RollApplicationService } from '$lib/backend/dice_rolling/application/RollApplicationService';

const rollService = new RollApplicationService();

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) error(401, 'Unauthorized');
	await rollService.recalculateStats(locals.user.id);
	return json({ ok: true });
};

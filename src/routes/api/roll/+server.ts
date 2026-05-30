import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RollApplicationService } from '$lib/backend/dice_rolling';

const rollService = new RollApplicationService();

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const body = await request.json();
	const { dice, modifier = 0, name = '' } = body as {
		dice: Array<{ dieType: 4 | 6 | 8 | 10 | 12 | 20 | 100; value: number; note?: string }>;
		modifier: number;
		name: string;
	};

	if (!Array.isArray(dice) || dice.length === 0) error(400, 'At least one die roll is required');

	try {
		const result = await rollService.executeRoll(locals.user.id, dice, modifier, name);
		return json(result);
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('[POST /api/roll]', e);
		error(500, msg);
	}
};

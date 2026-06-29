import { error, json } from '@sveltejs/kit';

import type { RollRecord } from '$lib/backend/dice_rolling';
import { RollApplicationService } from '$lib/backend/dice_rolling';

import type { RequestHandler } from './$types';

const rollService = new RollApplicationService();

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const body = (await request.json()) as { name?: string; rolls?: RollRecord[] };
	const fields: { name?: string; rolls?: RollRecord[] } = {};

	if (typeof body.name === 'string') fields.name = body.name;
	if (Array.isArray(body.rolls)) fields.rolls = body.rolls;

	if (Object.keys(fields).length === 0) error(400, 'Provide name or rolls to update');

	await rollService.updateSession(params.id, locals.user.id, fields);
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');
	await rollService.deleteSession(params.id, locals.user.id);
	return json({ ok: true });
};

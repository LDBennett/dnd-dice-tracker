import { RollApplicationService } from '$lib/backend/dice_rolling';

import type { PageServerLoad } from './$types';

const rollService = new RollApplicationService();

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user ?? null;
	const dashboard = user
		? await rollService.getPlayerDashboard(user.id)
		: await rollService.getPublicDashboard();

	return { dashboard };
};

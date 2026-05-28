import type { PageServerLoad } from './$types';
import { RollApplicationService } from '$lib/subdomains/dice_rolling';

const rollService = new RollApplicationService();

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user ?? null;
	const dashboard = user
		? await rollService.getPlayerDashboard(user.id)
		: await rollService.getPublicDashboard();

	return { user, dashboard };
};

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { RollApplicationService } from '$lib/subdomains/dice_rolling/application/RollApplicationService';

const rollService = new RollApplicationService();

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login');
	}

	const dashboard = await rollService.getPlayerDashboard(event.locals.user.id);

	return {
		user: event.locals.user,
		dashboard
	};
};

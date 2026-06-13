import { redirect } from '@sveltejs/kit';

import { getAuth } from '$lib/server/auth';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		await getAuth().api.signOut({ headers: event.request.headers });
		redirect(302, '/login');
	}
};

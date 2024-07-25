import { sql } from '$lib/db';
import { fail, type Actions } from '@sveltejs/kit';

import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const submissions = await sql(
		`SELECT rid, placements, city_live, city_work, city_visit, city_avoid, created_at FROM submissions`
	);

	return { submissions };
};

export const actions: Actions = {
	delete: async ({ request, cookies }) => {
		// if (cookies.get('username') === undefined) {
		// 	return fail(401);
		// }

		const formData = await request.formData();
		const id = formData.get('identifier');

		if (id) {
			await sql`DELETE FROM submissions WHERE rid = ${id}`;
		}
	}
};

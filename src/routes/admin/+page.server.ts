import { sql } from '$lib/db';
import { fail, type Actions } from '@sveltejs/kit';

import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const submissions = await sql(`
		SELECT rid, submissions.city_live, submissions.city_work, submissions.city_visit, submissions.city_avoid, submissions.created_at, 
		json_object_agg(placements.name, ST_AsGeoJSON(placements.location)) as placements
		FROM submissions
		LEFT JOIN placements USING (rid)
		GROUP BY rid`);

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

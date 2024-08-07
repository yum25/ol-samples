import { sql } from '$lib/db';
import { redirect, fail, type Actions } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const username = cookies.get('username');
	if (username === undefined) {
		throw redirect(302, '/login');
	}

	const submissions = await sql(`
		SELECT rid, s.city_live, s.city_work, s.city_visit, s.city_avoid, s.created_at, 
		json_object_agg(p.name, ST_AsGeoJSON(p.location)) as placements
		FROM submissions s
		LEFT JOIN placements p USING (rid)
		GROUP BY rid`);

	return { submissions };
};

export const actions: Actions = {
	delete: async ({ request, cookies }) => {
		if (cookies.get('username') === undefined) {
			return fail(401);
		}

		const formData = await request.formData();
		const id = formData.get('identifier');

		if (id) {
			await sql`DELETE FROM submissions WHERE rid = ${id}`;
		}
	}
};

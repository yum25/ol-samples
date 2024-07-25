import { sql } from '$lib/db.js';
import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const placements = data.get('features');
		const city_live = data.get('city_live');
		const city_work = data.get('city_work');
		const city_visit = data.get('city_visit');
		const city_avoid = data.get('city_avoid');

		if (!placements || !city_live || !city_work || !city_avoid || !city_visit) {
			return fail(400);
		}

		const insertion = await sql`
		INSERT INTO submissions (city_live, city_work, city_visit, city_avoid, placements)
		SELECT '${city_live}', '${city_work}', '${city_visit}', '${city_avoid}', '${placements}'`;

		console.log(insertion);
	}
};

import { sql } from '$lib/db.js';
import { fail } from '@sveltejs/kit';
import type { Geometry } from 'ol/geom.js';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const placements = JSON.parse(data.get('features') as string) as Record<string, Geometry>;
		const city_live = data.get('city_live');
		const city_work = data.get('city_work');
		const city_visit = data.get('city_visit');
		const city_avoid = data.get('city_avoid');

		if (!placements || !city_live || !city_work || !city_avoid || !city_visit) {
			return fail(400);
		}

		const { rid } = (
			await sql`
			INSERT INTO submissions (city_live, city_work, city_visit, city_avoid)
			VALUES (${city_live}, ${city_work}, ${city_visit}, ${city_avoid}) RETURNING rid`
		)[0];

		Object.entries(placements).forEach(async ([name, geometry]: [string, Geometry]) => {
			await sql`INSERT INTO placements (rid, name, location) VALUES(${rid}, ${name}, ST_GeomFromGeoJSON(${geometry}))`;
		});
	}
};

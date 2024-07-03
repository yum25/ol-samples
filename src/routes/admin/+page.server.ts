import { sql } from '$lib/db';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const submissions = await sql(
		`SELECT rid, placements, city_live, city_work, city_visit, city_avoid, created_at FROM submissions`
	);

	return { submissions };
};

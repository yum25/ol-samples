import { sql } from '$lib/db';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const submissions = await sql(
		`SELECT placements, city_live, city_work, city_visit, city_avoid FROM submissions`
	);

	return { submissions };
};

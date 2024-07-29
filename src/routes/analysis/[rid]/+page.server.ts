import { sql } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const query = await sql(`
		SELECT rid, s.created_at, json_object_agg(p.name, ST_AsGeoJSON(p.location)) as placements
		FROM submissions s
		LEFT JOIN placements p USING (rid)
        WHERE rid=${params.rid}
		GROUP BY rid`);

	const [submission] = query as {
		rid: number;
		created_at: Date;
		placements: Record<string, string>;
	}[];

	return { submission };
};

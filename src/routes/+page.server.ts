import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const placements = data.get('features');
		const city_live = data.get('city_live');
		const city_work = data.get('city_work');
		const city_visit = data.get('city_visit');
		const city_avoid = data.get('city_avoid');

		if (!placements || !city_live || !city_work || !city_avoid) {
			return fail(400);
		}

		console.log(city_live, city_work, city_visit, city_avoid);
		// console.log(placements)
	}
};

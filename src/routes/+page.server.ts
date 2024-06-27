import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const placements = data.get('features');
		const city = data.get('city');
		const years = data.get('years');
		const collab = data.get('collab');

		// if (!placements || !city || !years || !collab) {
		// 	return fail(400);
		// }

		console.log(city, years, collab)
		console.log(placements)

		
	}
};

import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const placements = data.get('features');

		if (!placements) {
			return fail(400);
		}
	}
};

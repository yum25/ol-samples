import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ cookies }) => {
	if (cookies.get('username') !== undefined) {
		throw redirect(302, '/admin');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		if (cookies.get('username') !== undefined) {
			throw redirect(302, '/admin');
		}

		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (typeof username !== 'string' || username.length < 1) {
			return fail(400, {
				message: 'Invalid username'
			});
		}

		if (typeof password !== 'string' || password.length < 1) {
			return fail(400, {
				message: 'Invalid password'
			});
		}

		if (username.toString() === env.ADMIN_USERNAME && password.toString() === env.ADMIN_PASSWORD) {
			cookies.set('username', username.toString(), { path: '/' });
		} else {
			return fail(400, {
				message: 'Incorrect username or password'
			});
		}

		throw redirect(302, '/admin');
	}
};

<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../$types';
	import Button from '$lib/components/button.svelte';

	export let form: ActionData;

	let submitting = false;
</script>

<h1>Log in</h1>
<p style="color: red;">
	<small>
		{#if form?.message}
			{form.message}
		{/if}
	</small>
</p>
<form
	method="POST"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	}}
>
	<label for="username">Username: </label>
	<input name="username" />
	<label for="password">Password: </label>
	<input name="password" type="password" />
	<Button disabled={submitting}>Log in</Button>
</form>

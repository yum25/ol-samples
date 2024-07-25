<script lang="ts">
	import Map from '$lib/components/map.svelte';
	import Button from '$lib/components/button.svelte';
	import { enhance } from '$app/forms';

	let deleting: number | undefined;

	export let data;
</script>

<main>
	<h1>Submissions</h1>
	<section>
		{#each data.submissions as response}
			<div class="submission">
				<p><b>What city do you live in?: </b>{response.city_live}</p>
				<p><b>What city do you work in?: </b>{response.city_work}</p>
				<p><b>What city do you most enjoy visiting?: </b>{response.city_visit}</p>
				<p><b>What city do you avoid visiting?: </b>{response.city_avoid}</p>
				<Map id={`${response.rid}`} placements={response.placements} />
				<form
					method="POST"
					action="?/delete"
					use:enhance={() => {
						deleting = response.id;
						return async ({ update }) => {
							if (confirm('Are you sure you want to delete this submission?')) {
								await update();
							}

							deleting = undefined;
						};
					}}
				>
					<input type="hidden" name="identifier" value={response.rid} />
					<Button disabled={deleting === response.rid}>Delete submission</Button>
				</form>
			</div>
		{/each}
	</section>
</main>

<style>
	main {
		max-width: 1000px;
		margin: 0 auto;

		padding: 1rem;
	}

	section {
		display: grid;
		gap: 1rem;
	}

	.submission {
		padding: 0.5rem;
		outline: 2px solid black;
	}
</style>

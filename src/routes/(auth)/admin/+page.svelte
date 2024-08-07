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
		{#each data.submissions as { rid, city_live, city_work, city_visit, city_avoid, placements }}
			<div class="submission">
				<p><b>What city do you live in?: </b>{city_live}</p>
				<p><b>What city do you work in?: </b>{city_work}</p>
				<p><b>What city do you most enjoy visiting?: </b>{city_visit}</p>
				<p><b>What city do you avoid visiting?: </b>{city_avoid}</p>
				<Map id={`${rid}`} {placements} />
				<form
					method="POST"
					action="?/delete"
					use:enhance={() => {
						deleting = rid;
						return async ({ update }) => {
							if (confirm('Are you sure you want to delete this submission?')) {
								await update();
							}

							deleting = undefined;
						};
					}}
				>
					<input type="hidden" name="identifier" value={rid} />
					<Button disabled={deleting === rid}>Delete submission</Button>
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

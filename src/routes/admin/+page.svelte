<script lang="ts">
	export let data;
</script>

{#each data.submissions as response}
	<div>
		<p>{response.city_live}</p>
		<p>{response.city_work}</p>
		<p>{response.city_visit}</p>
		<p>{response.city_avoid}</p>
	</div>
{/each}

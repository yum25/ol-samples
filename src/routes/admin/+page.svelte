<script lang="ts">
	import Map from '$lib/components/map.svelte';

	export let data;
</script>

{#each data.submissions as response}
	<div>
		<p>{response.city_live}</p>
		<p>{response.city_work}</p>
		<p>{response.city_visit}</p>
		<p>{response.city_avoid}</p>
		<Map id={`${response.rid}`} placements={response.placements} />
	</div>
{/each}

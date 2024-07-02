<script lang="ts">
	import cities from '../references/cities.json';
	export let name: string;
	let value: string = '';
	let focused = false;
</script>

<input
	bind:value
	{name}
	on:focus={() => (focused = true)}
	on:blur={() => setTimeout(() => (focused = false), 100)}
/>
{#each cities as city}
	{#if value.length > 0 && city.toLowerCase().includes(value.toLowerCase()) && focused}
		<button type="button" on:click={() => (value = city)}>{city}</button>
	{/if}
{/each}

<style>
</style>

<script lang="ts">
	import cities from '../references/cities.json';
	export let name: string;
	export let value: string;
	let focused = false;
</script>

<input
	bind:value
	{name}
	on:focus={() => (focused = true)}
	on:blur={() => setTimeout(() => (focused = false), 100)}
/>
{#if value.length > 0 && focused}
	<div class="dropdown">
		{#each cities as city}
			{#if city.toLowerCase().includes(value.toLowerCase()) && focused}
				<button type="button" on:click={() => (value = city)}>{city}</button>
			{/if}
		{/each}
	</div>
{/if}

<style>
	input {
		outline: 1px solid black;
		border: none;

		height: 2rem;
		font-size: 1rem;
		padding: 0.25rem 0.25rem 0.25rem 1rem;
	}

	.dropdown {
		max-height: 15rem;
		overflow-y: scroll;

		display: flex;
		flex-direction: column;

		outline: 1px solid lightgray;
		box-shadow: 1px 1px 5px lightgray;
	}

	button {
		border: none;
		border-bottom: 1px solid lightgray;
		background: none;

		padding: 0.5rem;
		font-size: 1rem;
	}
</style>

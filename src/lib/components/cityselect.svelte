<script lang="ts">
	import cities from '../references/cities.json';
	export let name: string;
	export let value: string;
	export let label: string;
	let focused = false;
</script>

<span>
	<label for={name}><b>{label}</b></label>
	<input
		bind:value
		{name}
		on:focus={() => (focused = true)}
		on:blur={() => setTimeout(() => (focused = false), 100)}
	/>
	{#if value.length > 0 && focused}
		{@const filteredCities = cities.filter((city) =>
			city.toLowerCase().includes(value.toLowerCase())
		)}
		{#if filteredCities.length > 0}
			<div class="dropdown">
				{#each filteredCities as city}
					<button type="button" on:click={() => (value = city)}>{city}</button>
				{/each}
			</div>
		{/if}
	{/if}
</span>

<style>
	span {
		display: grid;
		gap: 0.5rem;
	}
	input,
	input:focus {
		outline: 1px solid lightgray;
		border: none;

		height: 2rem;
		width: 28rem;

		font-size: 1rem;
		padding: 0.25rem 0.25rem 0.25rem 1rem;
	}

	.dropdown {
		width: 29rem;
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

		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		font-size: 1rem;
	}
</style>

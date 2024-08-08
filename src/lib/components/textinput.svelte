<script lang="ts">
	export let name: string;
	export let value: string = '';
	export let password: boolean = false;
</script>

<label for={name}><slot></slot></label>
{#if password}
	<input bind:value {name} type="password" on:focus on:blur />
{:else}
	<input bind:value {name} on:focus on:blur />
{/if}

<style>
	input,
	input:focus {
		outline: 1px solid lightgray;
		border: none;

		height: 2rem;
		width: 28rem;

		font-size: 1rem;
		padding: 0.25rem 0.25rem 0.25rem 1rem;
	}
</style>

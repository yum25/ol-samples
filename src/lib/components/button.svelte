<script lang="ts">
	export let disabled = false;
	export let ref: HTMLButtonElement | null = null;
</script>

<button class:disabled {disabled} on:click bind:this={ref}><slot></slot></button>

<style>
	button {
		background: rgb(2, 176, 2);
		border-radius: 0.15rem;
		padding: 0.5rem;

		color: white;
		font-weight: bold;
		font-size: 1rem;
		text-transform: uppercase;

		border: 1px solid rgb(231, 231, 231);
	}

	button:hover {
		background: rgb(0, 140, 0);
	}

	.disabled,
	.disabled:hover {
		background: lightgray;
	}
</style>

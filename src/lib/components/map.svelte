<script lang="ts">
	import CanvasMap from 'ol/Map.js';
	import { onMount } from 'svelte';

	export let id;
	let map: CanvasMap;

	onMount(() => {});
</script>

<div {id}></div>

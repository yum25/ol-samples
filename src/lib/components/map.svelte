<script lang="ts">
	import CanvasMap from 'ol/Map.js';
	import View from 'ol/View.js';
	import { getCenter } from 'ol/extent';
	import { VectorTile } from 'ol/layer';
	import { stylefunction } from 'ol-mapbox-style';

	import { onMount } from 'svelte';
	import { baseSource, getCountiesExtent } from '../utils';

	import styles from '../styles.json';

	export let id: string;
	export let placements;
	let map: CanvasMap;

	const extent = getCountiesExtent();
	const center = getCenter(extent);

	const view = new View({
		center,
		extent,
		zoom: 11,
		minZoom: 11,
		maxZoom: 17
	});

	const baseLayer = new VectorTile({
		declutter: true,
		source: baseSource
	});

	onMount(() => {
		map = new CanvasMap({
			target: id,
			layers: [baseLayer],
			controls: [],
			view
		});

		stylefunction(baseLayer, styles, 'esri');
	});
</script>

<div {id} class="map-container"></div>

<style>
	.map-container {
		height: 30rem;
	}
</style>

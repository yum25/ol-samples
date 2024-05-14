<script lang="ts">
	import Map from 'ol/Map.js';
	import View from 'ol/View.js';
	import VectorSource from 'ol/source/Vector';
	import VectorLayer from 'ol/layer/Vector';

	import GeoJSON from 'ol/format/GeoJSON';

	import { getCenter } from 'ol/extent';
	import { Fill, Stroke, Style, Circle } from 'ol/style';

	import counties from '$lib/references/community_boundaries.json';
	import { onMount } from 'svelte';

	import Polygon from 'ol/geom/Polygon';

	const getCityExtent = () => {
		const border = new Polygon([
			[[-83.2877264711691, 42.2549612971133]],
			[[-82.910343680423, 42.4503749373053]]
		]);

		border.scale(1.2);

		return border.getExtent();
	};

	const geojsonFormatter = new GeoJSON();
	const extent = getCityExtent();
	const center = getCenter(extent);

	onMount(() => {
		new Map({
			target: 'map',
			layers: [
				new VectorLayer({
					source: new VectorSource({
						features: geojsonFormatter.readFeatures(counties)
					})
				})
			],
			view: new View({
				center,
				extent,
				zoom: 2
			})
		});
	});
</script>

<div id="map"></div>

<style>
	#map {
		height: 100vh;
		background-color: #04041b;
	}
</style>

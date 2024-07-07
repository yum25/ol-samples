<script lang="ts">
	import CanvasMap from 'ol/Map.js';
	import View from 'ol/View.js';
	import VectorSource from 'ol/source/Vector';
	import VectorLayer from 'ol/layer/Vector';
	import { VectorTile } from 'ol/layer';
	import GeoJSON from 'ol/format/GeoJSON';

	import { getCenter } from 'ol/extent';
	import { useGeographic } from 'ol/proj';
	import { Polygon } from 'ol/geom';
	import { stylefunction } from 'ol-mapbox-style';

	import { onMount } from 'svelte';

	import { baseSource, getCountiesExtent } from '$lib/utils';
	import { baseStyle } from '$lib/styles';

	import boundaries from '$lib/references/boundaries.json';
	import styles from '$lib/styles.json';

	export let id: string;
	export let placements;

	let map: CanvasMap;

	useGeographic();

	const geojsonFormatter = new GeoJSON();
	const extent = getCountiesExtent();
	const center = getCenter(extent);

	const baseLayer = new VectorTile({
		declutter: true,
		source: baseSource
	});

	const boundarySource = new VectorSource({
		features: geojsonFormatter.readFeatures(boundaries)
	});

	const boundaryLayer = new VectorLayer({
		source: boundarySource,
		style: (feature) => baseStyle(feature)
	});

	const view = new View({
		center,
		extent,
		zoom: 2,
		minZoom: 0,
		maxZoom: 17
	});

	onMount(() => {
		map = new CanvasMap({
			target: id,
			layers: [baseLayer, boundaryLayer],
			controls: [],
			view
		});

		stylefunction(baseLayer, styles, 'esri');

		boundarySource.getFeatures().forEach((feature) => {
			feature.set('default', feature.clone());
			if (
				Object.keys(placements).includes(feature.get('name')) &&
				feature.get('name') !== 'Detroit' &&
				feature.get('name') !== 'Ecorse'
			) {
				feature.setGeometry(new Polygon(placements[feature.get('name')]));
			}
		});
	});
</script>

<div {id} class="map-container"></div>

<style>
	.map-container {
		width: 100%;
		height: 30rem;
	}
</style>

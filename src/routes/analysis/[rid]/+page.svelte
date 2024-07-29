<script lang="ts">
	import CanvasMap from 'ol/Map.js';
	import View from 'ol/View.js';
	import VectorSource from 'ol/source/Vector';
	import VectorLayer from 'ol/layer/Vector';
	import { VectorTile } from 'ol/layer';
	import GeoJSON from 'ol/format/GeoJSON';

	import { getCenter } from 'ol/extent';
	import { Polygon, MultiPolygon } from 'ol/geom';
	import { stylefunction } from 'ol-mapbox-style';

	import { onMount } from 'svelte';

	import { baseSource, getCountiesExtent } from '$lib/utils';
	import { baseStyle } from '$lib/styles';
	import boundaries from '$lib/references/boundaries.json';
	import coords from '$lib/references/coords.json';
	import styles from '$lib/styles.json';

	export let data;
	let map: CanvasMap;

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
		zoom: 11,
		minZoom: 11,
		maxZoom: 17
	});

	onMount(() => {
		map = new CanvasMap({
			target: 'map',
			layers: [baseLayer, boundaryLayer],
			controls: [],
			view
		});

		stylefunction(baseLayer, styles, 'esri');

		boundarySource.getFeatures().forEach((feature) => {
			feature.set('default', feature.clone());
			if (Object.keys(coords).includes(feature.get('name'))) {
				const placement = JSON.parse(data.submission.placements[feature.get('name')]);

				feature.setGeometry(
					placement.type === 'Polygon'
						? new Polygon(placement.coordinates)
						: new MultiPolygon(placement.coordinates)
				);
			}
		});
	});
</script>

<div id="map"></div>

<style>
	#map {
		height: 100vh;
	}
</style>

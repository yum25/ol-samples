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

	import Button from '$lib/components/button.svelte';
	import { baseSource, getCountiesExtent, getBordersAccuracy, isStatic } from '$lib/utils';
	import { viewStyle } from '$lib/styles';
	import boundaries from '$lib/references/boundaries.json';
	import styles from '$lib/references/basestyles.json';

	export let data;
	let { rid, created_at, placements } = data.submission;
	let map: CanvasMap;
	let accuracy: number;

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
		style: (feature) => viewStyle(feature)
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

		const features = boundarySource.getFeatures();

		features.forEach((feature, i) => {
			feature.set('default', feature.clone());
			if (Object.keys(placements).includes(feature.get('name'))) {
				const placement = JSON.parse(placements[feature.get('name')]);

				feature.setGeometry(
					placement.type === 'Polygon'
						? new Polygon(placement.coordinates)
						: new MultiPolygon(placement.coordinates)
				);
			}

			if (i === features.length - 1) {
				accuracy = getBordersAccuracy(features.filter((feature) => !isStatic(feature)));
			}
		});
	});
</script>

<div id="map"></div>

<section id="analysis">
	<div style="display: flex;">
		{#if accuracy !== 0}
			<div style="width: {accuracy}%; background: lightgreen; padding: 0.5rem;">
				<b>{accuracy}%</b>
			</div>
		{/if}
		{#if 100 - accuracy !== 0}
			<div style="width: {100 - accuracy}%; background: lightcoral; padding: 0.5rem;"></div>
		{/if}
	</div>
	<p>
		You got {accuracy}% of the bordering municipalities positioned correctly!
	</p>
	<Button
		on:click={() => {
			const url = map.getTargetElement()?.querySelector('canvas')?.toDataURL('image/png');

			if (!!url) {
				const a = document.createElement('a');
				a.download = 'map.png';
				a.href = url;
				a.click();
				a.remove();
			}
		}}>Download PNG</Button
	>
</section>

<style>
	#map {
		height: 100vh;
	}

	#analysis {
		position: absolute;
		top: 6.5%;
		left: 2%;

		max-width: 30rem;
		border-radius: 0.5rem;
		background: white;

		padding: 1rem;
	}
</style>

<script lang="ts">
	import Map from 'ol/Map.js';
	import View from 'ol/View.js';
	import VectorSource from 'ol/source/Vector';
	import VectorLayer from 'ol/layer/Vector';
	import GeoJSON from 'ol/format/GeoJSON';
	import Polygon from 'ol/geom/Polygon';

	import { getCenter } from 'ol/extent';
	import { Select, Translate, defaults as defaultInteractions } from 'ol/interaction.js';
	import { Fill, Stroke, Style, Text } from 'ol/style';

	import counties from '$lib/references/community_boundaries.json';
	import { onMount } from 'svelte';

	const getCityExtent = () => {
		const border = new Polygon([
			[[-84.2877264711691, 44.2549612971133]],
			[[-82.010343680423, 40.6503749373053]]
		]);

		border.scale(1.2);

		return border.getExtent();
	};

	const geojsonFormatter = new GeoJSON();
	const extent = getCityExtent();
	const center = getCenter(extent);
	const select = new Select();
	const translate = new Translate({
		features: select.getFeatures()
	});

	onMount(() => {
		let map = new Map({
			target: 'map',
			interactions: defaultInteractions().extend([select, translate]),
			layers: [
				new VectorLayer({
					source: new VectorSource({
						features: geojsonFormatter.readFeatures(counties)
					}),
					style: function (feature) {
						return new Style({
							text: new Text({ text: feature.get('name') }),
							stroke: new Stroke({
								color: 'gray',
								width: 2
							}),
							fill: new Fill({
								color: 'white'
							})
						});
					}
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
	}
</style>

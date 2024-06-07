<script lang="ts">
	import CanvasMap from 'ol/Map.js';
	import View from 'ol/View.js';
	import VectorSource from 'ol/source/Vector';
	import VectorLayer from 'ol/layer/Vector';
	import GeoJSON from 'ol/format/GeoJSON';

	import { getCenter } from 'ol/extent';
	import { Select, Translate, Snap, defaults as defaultInteractions } from 'ol/interaction.js';
	import { useGeographic } from 'ol/proj';
	import type { Feature } from 'ol';
	import { Polygon, type Geometry } from 'ol/geom';

	import { onMount } from 'svelte';

	import { getCountiesExtent, getDistanceFromDefault } from '$lib/utils';
	import { baseStyle, selectStyle } from '$lib/styles';

	import counties from '$lib/references/counties.json';
	import detroit from '$lib/references/detroit.json';
	import coords from '$lib/references/coords.json';

	import { VectorTile } from 'ol/layer';
	import { baseSource } from '$lib//utils';
	import styles from '$lib/styles.json';

	import { stylefunction } from 'ol-mapbox-style';

	const geojsonFormatter = new GeoJSON();
	const extent = getCountiesExtent();
	const center = getCenter(extent);

	const baseLayer = new VectorTile({
		declutter: true,
		source: baseSource
	});

	const countyLayer = new VectorLayer({
		source: new VectorSource({
			features: geojsonFormatter.readFeatures(counties)
		}),
		style: (feature) => baseStyle(feature, defaultFeatures[feature.get('name')])
	});

	const defaultFeatures: Record<string, Feature> = (
		countyLayer.getSource() as VectorSource<Feature<Geometry>>
	)
		.getFeatures()
		.reduce((dict, feature) => ({ ...dict, [feature.get('name')]: feature.clone() }), {});

	const select = new Select({
		filter: (feature) => feature.get('name') !== 'Detroit',
		style: (feature) => selectStyle(feature, defaultFeatures[feature.get('name')])
	});

	const translate = new Translate({
		features: select.getFeatures()
	});

	const snap = new Snap({
		source: new VectorSource({
			features: geojsonFormatter.readFeatures(detroit)
		})
	});

	translate.on('translateend', (e) => {
		const feature = e.features.getArray()[0];
		if (getDistanceFromDefault(feature, defaultFeatures[feature.get('name')]) < 0.01) {
			feature.setGeometry(defaultFeatures[feature.get('name')].clone().getGeometry());
		}
	});

	onMount(() => {
		useGeographic();

		let map = new CanvasMap({
			target: 'map',
			interactions: defaultInteractions().extend([select, translate]),
			layers: [baseLayer, countyLayer],
			controls: [],
			view: new View({
				center,
				extent,
				zoom: 11,
				minZoom: 11,
				maxZoom: 17
			})
		});

		stylefunction(baseLayer, styles, 'esri');

		(countyLayer.getSource() as VectorSource<Feature<Geometry>>).getFeatures().forEach((feature) => {
			if (Object.keys(coords).includes(feature.get('name')) ) {
				feature.setGeometry(new Polygon(coords[feature.get('name')]));
			}
		});

		map.addInteraction(snap);
	});
</script>

<div id="map"></div>

<style>
	#map {
		height: 100vh;
	}
</style>

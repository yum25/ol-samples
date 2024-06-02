<script lang="ts">
	import Map from 'ol/Map.js';
	import View from 'ol/View.js';
	import VectorSource from 'ol/source/Vector';
	import VectorLayer from 'ol/layer/Vector';
	import GeoJSON from 'ol/format/GeoJSON';
	import Polygon from 'ol/geom/Polygon';

	import { getCenter } from 'ol/extent';
	import { Select, Translate, Snap, defaults as defaultInteractions } from 'ol/interaction.js';
	import { Fill, Stroke, Style, Text } from 'ol/style';

	import counties from '$lib/references/counties.json';
	import detroit from '$lib/references/detroit.json';
	import { onMount } from 'svelte';
	import { useGeographic } from 'ol/proj';
	import type { Feature } from 'ol';
	import type { Geometry } from 'ol/geom';

	// FIXME: numerous type errors and repeated code
	const getCountiesExtent = () => {
		const border = new Polygon([
			[[-83.7877264711691, 42.6549612971133]],
			[[-82.510343680423, 42.0503749373053]]
		]);

		border.scale(1.2);

		return border.getExtent();
	};

	const getFeatureCenter = (feature: Feature) => {
		return getCenter((feature.getGeometry() as Geometry).getExtent())
	}

	const geojsonFormatter = new GeoJSON();
	const extent = getCountiesExtent();
	const center = getCenter(extent);

	const style = (stroke: Stroke, overflow: boolean) => function (feature: Feature) {
		const currentCenter = getFeatureCenter(feature)
		const defaultCenter = getFeatureCenter(defaultGeometries[feature.get('name')]);

		return new Style({
			text: new Text({ text: feature.get('name'), font: '12px sans-serif', overflow }),
			stroke,
			fill: new Fill({
				color:
					currentCenter[0] === defaultCenter[0] && currentCenter[1] === defaultCenter[1]
						? 'rgb(119, 174, 116)'
						: 'white'
			})
		});
	};

	const base = new VectorLayer({
		source: new VectorSource({
			features: geojsonFormatter.readFeatures(counties)
		}),
		style: style(new Stroke({
				color: "gray",
				width: 2
			}), false)
	});

	const select = new Select({
		filter: function (feature) {
			return feature.get('name') !== 'Detroit';
		},
		style: style(new Stroke({
				color: "blue",
				width: 4
			}), true)
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
		const newCenter = getFeatureCenter(e.features.getArray()[0]);
		const oldCenter = getFeatureCenter(defaultGeometries[e.features.getArray()[0].get('name')])

		if (Math.hypot(Math.abs(newCenter[0] - oldCenter[0]), Math.abs(newCenter[1] - oldCenter[1])) < 0.01) {
			e.features.getArray()[0].setGeometry(defaultGeometries[e.features.getArray()[0].get('name')].clone().getGeometry());
		}
	});

	const defaultGeometries = base
		.getSource()
		.getFeatures()
		.reduce(
			(dict, feature) => ({ ...dict, [feature.get('name')]: feature.clone()}),
			{}
		);

	onMount(() => {
		useGeographic();

		let map = new Map({
			target: 'map',
			interactions: defaultInteractions().extend([select, translate]),
			layers: [base],
			view: new View({
				center,
				extent,
				zoom: 0,
				minZoom: 0,
				maxZoom: 17
			})
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

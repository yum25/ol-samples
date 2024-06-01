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

	const getCountiesExtent = () => {
		const border = new Polygon([
			[[-83.7877264711691, 42.6549612971133]],
			[[-82.510343680423, 42.0503749373053]]
		]);

		border.scale(1.2);

		return border.getExtent();
	};

	const geojsonFormatter = new GeoJSON();
	const extent = getCountiesExtent();
	const center = getCenter(extent);
	const select = new Select({
		filter: function (feature) {
			return feature.get('name') !== 'Detroit';
		},
		style: function (feature) {
			return new Style({
				text: new Text({ text: feature.get('name'), font: '12px sans-serif', overflow: true }),
				stroke: new Stroke({
					color: 'blue',
					width: 4
				}),
				fill: new Fill({
					color: 'white'
				})
			});
		}
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
		console.log(getCenter(e.features.getArray()[0].getGeometry().getExtent()));
	});

	onMount(() => {
		useGeographic();
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
							text: new Text({ text: feature.get('name'), font: '12px sans-serif' }),
							stroke: new Stroke({
								color: 'gray',
								width: 2
							}),
							fill: new Fill({
								color: feature.get('name') === 'Detroit' ? 'rgb(119, 174, 116)' : 'white'
							})
						});
					}
				})
			],
			view: new View({
				center,
				extent,
				zoom: 0,
				minZoom: 0,
				maxZoom: 17
			})
		});

		console.log(map.getLayers().getArray()[0]!.getSource().getFeatures() )

		map.addInteraction(snap);
	});
</script>

<div id="map"></div>

<style>
	#map {
		height: 100vh;
	}
</style>

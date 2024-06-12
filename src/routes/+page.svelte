<script lang="ts">
	import CanvasMap from 'ol/Map.js';
	import View from 'ol/View.js';
	import VectorSource from 'ol/source/Vector';
	import VectorLayer from 'ol/layer/Vector';
	import { VectorTile } from 'ol/layer';
	import GeoJSON from 'ol/format/GeoJSON';

	import { getCenter } from 'ol/extent';
	import { Select, Translate, Snap, defaults as defaultInteractions } from 'ol/interaction.js';
	import { useGeographic } from 'ol/proj';
	import { Polygon, type Geometry } from 'ol/geom';
	import type { Feature } from 'ol';
	import { stylefunction } from 'ol-mapbox-style';

	import { onMount } from 'svelte';

	import { baseSource, getCountiesExtent, getDistanceFromDefault } from '$lib/utils';
	import { baseStyle, selectStyle } from '$lib/styles';
	import { complete } from '$lib/stores';

	import counties from '$lib/references/counties.json';
	import detroit from '$lib/references/detroit.json';
	import coords from '$lib/references/coords.json';
	import styles from '$lib/styles.json';

	let map: CanvasMap;
	let hide = false;
	let hideSearch = true;
	let search = '';

	useGeographic();

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
		style: (feature) => baseStyle(feature)
	});

	const view = new View({
		center,
		extent,
		zoom: 11,
		minZoom: 11,
		maxZoom: 17
	});

	const select = new Select({
		filter: (feature) => feature.get('name') !== 'Detroit',
		style: (feature) => selectStyle(feature)
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
		if (getDistanceFromDefault(feature) < 0.01) {
			feature.setGeometry(feature.get('default').clone().getGeometry());
		}
	});

	onMount(() => {
		map = new CanvasMap({
			target: 'map',
			interactions: defaultInteractions().extend([select, translate]),
			layers: [baseLayer, countyLayer],
			controls: [],
			view
		});

		stylefunction(baseLayer, styles, 'esri');

		(countyLayer.getSource() as VectorSource<Feature<Geometry>>)
			.getFeatures()
			.forEach((feature) => {
				feature.set('default', feature.clone());
				if (Object.keys(coords).includes(feature.get('name'))) {
					feature.setGeometry(new Polygon(coords[feature.get('name')]));
				}
			});

		map.addInteraction(snap);
	});
</script>

<div id="map"></div>
<div id="info">
	<button class="button window" on:click={() => (hide = !hide)}> ― </button>
	<div class:collapsed={hide}>
		<p>Rearrange the county borders. To confirm your placements, press the button below.</p>
		<button class="button command" on:click={() => $complete = true}> Finish </button>
	</div>
</div>
<div class="search">
	<button class="button searchicon" on:click={() => (hideSearch = !hideSearch)}>⌕</button>
	<input
		class:textfield={!hideSearch}
		class:textfieldhidden={hideSearch}
		bind:value={search}
		on:blur={() => (hideSearch = true)}
	/>
</div>

<button
	class="button nav left"
	on:click={() =>
		view.animate({ center: [-83.58403507579606, 42.362668117209296], zoom: 11.7, duration: 500 })}
>
	⟨
</button>
<button
	class="button nav right"
	on:click={() =>
		view.animate({ center: [-83.08403507579606, 42.362668117209296], zoom: 11.7, duration: 500 })}
>
	⟩
</button>

<style>
	@keyframes extend {
		from {
			width: 0;
		}
		to {
			width: 80%;
		}
	}

	#info {
		position: absolute;
		top: 2%;
		left: 2%;

		max-width: 30rem;
		border-radius: 0.5rem;
		background: white;

		padding: 1rem;
	}

	.collapsed {
		display: none;
	}

	.button {
		background: white;
		border: none;
	}

	.window {
		height: 1.5rem;

		outline: 1px solid rgb(231, 231, 231);
		font-weight: bold;
	}

	.window:hover {
		background: rgb(231, 231, 231);
	}

	.command {
		background: rgb(2, 176, 2);
		border-radius: 0.15rem;
		padding: 0.5rem;

		color: white;
		font-weight: bold;
		font-size: 1rem;
		text-transform: uppercase;
	}

	.command:hover {
		background: rgb(0, 140, 0);
	}

	.nav {
		position: absolute;
		top: 50%;

		height: 3.5rem;
		width: 3.5rem;
		border-radius: 50%;
		font-size: 2.5rem;

		background: white;
		border: none;
		opacity: 60%;
	}

	.nav:hover {
		opacity: 100%;
	}

	.search {
		display: flex;
		justify-content: end;
		gap: 0.5rem;
		width: 25%;

		position: absolute;
		top: 2%;
		right: 2%;
	}

	.searchicon {
		height: 3.5rem;
		width: 3.5rem;
		border-radius: 50%;
		font-size: 2.5rem;

		background: white;
		border: none;
		opacity: 60%;
	}

	.searchicon:hover {
		opacity: 100%;
	}

	.textfield {
		font-size: 1rem;

		opacity: 60%;
		height: 3.5rem;
		border-radius: 2rem;
		padding-left: 1rem;

		border: none;
		animation: extend ease forwards 1s;
	}

	.textfield:focus {
		opacity: 100%;
	}

	.textfieldhidden {
		display: none;
		width: 0;
		animation: extend ease reverse 1s;
	}

	.left {
		left: 1%;
	}

	.right {
		right: 1%;
	}
	#map {
		height: 100vh;
	}
</style>

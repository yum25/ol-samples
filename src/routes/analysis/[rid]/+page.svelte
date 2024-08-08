<script lang="ts">
	import CanvasMap from 'ol/Map.js';
	import View from 'ol/View.js';
	import VectorSource from 'ol/source/Vector';
	import VectorLayer from 'ol/layer/Vector';
	import { VectorTile } from 'ol/layer';
	import GeoJSON from 'ol/format/GeoJSON';

	import { Polygon, MultiPolygon } from 'ol/geom';
	import { stylefunction } from 'ol-mapbox-style';

	import { onMount } from 'svelte';

	import { baseSource, getCountiesExtent, getBordersAccuracy, isStatic } from '$lib/utils';
	import { viewStyle, submissionView } from '$lib/styles';

	import boundaries from '$lib/references/boundaries.json';
	import styles from '$lib/references/basestyles.json';
	import html2canvas from 'html2canvas';

	export let data;
	let { rid, created_at, placements } = data.submission;
	let map: CanvasMap;
	let container: HTMLDivElement;
	let dialog: HTMLDialogElement;

	let accuracy: number;

	const geojsonFormatter = new GeoJSON();
	const extent = getCountiesExtent();

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
		extent,
		minZoom: 11,
		maxZoom: 17,
		...submissionView
	});

	onMount(() => {
		dialog.showModal();
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

<div bind:this={container}>
	<div id="map"></div>
	<div class="bar">
		{#if accuracy !== 0}
			<div style="width: {accuracy}%; background: lightgreen; padding: 0.5rem; text-align: center;">
				<b>{accuracy}%</b>
			</div>
		{/if}
		{#if 100 - accuracy !== 0}
			<div style="width: {100 - accuracy}%; background: lightcoral; padding: 0.5rem;"></div>
		{/if}
	</div>
</div>

<dialog bind:this={dialog}>
	<button class="btn" style="float: right; font-size: 1.5rem;" on:click={() => dialog.close()}
		>✕</button
	>
	<p>
		You got <b>{accuracy}%</b> of the bordering municipalities positioned correctly!
	</p>
	<hr style="border: 0.5px solid lightgray;" />
	<div id="actions">
		<button class="action btn">
			<div class="icon"></div>
			<p>Share</p>
		</button>

		<button
			class="action btn"
			on:click={async () => {
				const url = (await html2canvas(container))?.toDataURL('image/png');

				if (!!url) {
					const a = document.createElement('a');
					a.download = 'map.png';
					a.href = url;
					a.click();
					a.remove();
				}
			}}
		>
			<div class="icon"></div>
			<p>Get Results</p>
		</button>

		<button class="action btn">
			<div class="icon"></div>
			<p>Copy Link</p>
		</button>
	</div>
</dialog>

<style>
	#map {
		height: 100vh;
	}

	#actions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));
		place-content: center;

		padding-left: 1rem;
	}

	dialog {
		width: 40%;

		border: none;
		border-radius: 0.5rem;
		box-shadow: 1px 1px 5px gray;
	}

	dialog > p {
		text-align: center;
		font-size: 1.5rem;
	}

	dialog > p > b {
		font-size: 2.5rem;
		background: -webkit-linear-gradient(#55c264, #7dd87d);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.btn {
		background: none;
		border: none;
		font-size: 1rem;
	}

	.action {
		display: flex;
		align-items: center;
	}

	.action > p {
		margin-left: 0.5rem;
	}

	.icon {
		background: red;
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid grey;
		border-radius: 50%;
	}

	.bar {
		display: flex;

		position: absolute;
		top: 3.5%;
		left: 10%;

		width: 80%;

		border-radius: 0.5rem;
		border: 2px solid white;
		overflow: hidden;
	}
</style>

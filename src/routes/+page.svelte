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
	import { Polygon } from 'ol/geom';
	import { stylefunction } from 'ol-mapbox-style';

	import { onMount } from 'svelte';

	import {
		baseSource,
		getBordersAccuracy,
		getCountiesExtent,
		getDistanceFromDefault,
		getFeatureCenter,

		isDetroit

	} from '$lib/utils';
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
	let searchRef: HTMLInputElement;

	useGeographic();

	const geojsonFormatter = new GeoJSON();
	const extent = getCountiesExtent();
	const center = getCenter(extent);

	const baseLayer = new VectorTile({
		declutter: true,
		source: baseSource
	});

	const countySource = new VectorSource({
		features: geojsonFormatter.readFeatures(counties)
	});

	const countyLayer = new VectorLayer({
		source: countySource,
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

		countySource.getFeatures().forEach((feature) => {
			feature.set('default', feature.clone());
			if (Object.keys(coords).includes(feature.get('name'))) {
				feature.setGeometry(new Polygon(coords[feature.get('name')]));
			}
		});

		map.addInteraction(snap);
	});
</script>

<div id="map"></div>
<button class="button window" on:click={() => (hide = !hide)}> ― </button>
<section id="info" class:collapsed={hide}>
	<div>
		<p>Rearrange the county borders. To confirm your placements, press the button below.</p>
		{#if $complete}
		<p>{getBordersAccuracy(countySource.getFeatures().filter((feature) => !isDetroit(feature)))}</p>
		{/if}
		<button class="button command" on:click={() => ($complete = true)}> Finish </button>
	</div>
</section>
<section id="find">
	<button
		class="button icon"
		on:click={() => {
			hideSearch = !hideSearch;
			setTimeout(() => {
				if (!hideSearch) {
					searchRef.focus();
				}
			}, 1000);
		}}
	>
		<div
			style="-webkit-transform: rotate(45deg); -moz-transform: rotate(45deg); -o-transform: rotate(45deg); transform: rotate(45deg);"
		>
			⚲
		</div>
	</button>
	{#if !hideSearch}
		{@const features = countySource
			.getFeatures()
			.filter((feature) => feature.get('name').toLowerCase().includes(search.toLowerCase()))}
		<div class:search={!hideSearch}>
			<input
				class:textfield={!hideSearch}
				bind:this={searchRef}
				bind:value={search}
				on:blur={() => (hideSearch = true)}
			/>
			<div class="results">
				{#each features as feature}
					<button
						on:click={() => {
							select.getFeatures().push(feature);
							view.animate({ center: getFeatureCenter(feature), duration: 500 });
						}}
					>
						{feature.get('name')}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</section>

<button
	class="button nav left"
	on:click={() =>
		view.animate({ center: [-83.58403507579606, 42.362668117209296], zoom: 11.7, duration: 500 })}
>
	◀
</button>
<button
	class="button nav right"
	on:click={() =>
		view.animate({ center: [-83.08403507579606, 42.362668117209296], zoom: 11.7, duration: 500 })}
>
	▶
</button>

<style>
	@keyframes extend {
		from {
			width: 0;
		}
		to {
			width: 100%;
		}
	}

	#info {
		position: absolute;
		top: 8%;
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
		border: 1px solid rgb(231, 231, 231);
	}

	.button:hover {
		background: rgb(231, 231, 231);
	}

	.window {
		position: absolute;
		top: 2%;
		left: 2%;
		height: 2.1rem;
		width: 2.1rem;

		font-weight: bold;
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

		height: 2.25rem;
		width: 2.25rem;
		border-radius: 50%;
		font-size: 1rem;
	}

	.nav:hover {
		opacity: 100%;
	}

	#find {
		display: flex;
		justify-content: end;
		gap: 0.5rem;
		width: 25%;

		position: absolute;
		top: 2%;
		right: 2%;
	}

	.icon {
		height: 2.25rem;
		width: 2.2rem;
		aspect-ratio: 1;
		font-size: 1.6rem;

		background: white;
	}

	.search {
		animation: extend ease forwards 1s;
	}

	.textfield {
		font-size: 1rem;
		height: 2rem;
		padding-left: 0.5rem;

		border: 1px solid rgb(231, 231, 231);
		animation: extend ease forwards 0.5s;
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

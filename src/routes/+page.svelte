<script lang="ts">
	import CanvasMap from 'ol/Map.js';
	import View from 'ol/View.js';
	import VectorSource from 'ol/source/Vector';
	import VectorLayer from 'ol/layer/Vector';
	import { VectorTile } from 'ol/layer';
	import GeoJSON from 'ol/format/GeoJSON';

	import { getCenter } from 'ol/extent';
	import { Select, Translate, defaults as defaultInteractions } from 'ol/interaction.js';
	import { Polygon } from 'ol/geom';
	import { stylefunction } from 'ol-mapbox-style';

	import { onMount, onDestroy } from 'svelte';

	import {
		baseSource,
		getCountiesExtent,
		getDistanceFromDefault,
		getFeatureCenter,
		isStatic
	} from '$lib/utils';
	import { baseStyle, selectStyle, submissionView } from '$lib/styles';

	import CitySelect from '$lib/components/cityselect.svelte';
	import Button from '$lib/components/button.svelte';

	import boundaries from '$lib/references/boundaries.json';
	import coords from '$lib/references/coords.json';
	import styles from '$lib/references/basestyles.json';
	import cities from '$lib/references/cities.json';
	import { tolerance } from '$lib/constants';

	let map: CanvasMap;
	let positions = coords as Record<string, number[][][]>;
	let searchRef: HTMLInputElement;

	let state = 0;
	let hide = false;
	let hideSearch = true;
	let search = '';

	let city_live = '';
	let city_work = '';
	let city_visit = '';
	let city_avoid = '';

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

	const select = new Select({
		filter: (feature) => feature.get('name') !== 'Detroit',
		style: (feature) => selectStyle(feature)
	});

	const translate = new Translate({
		features: select.getFeatures()
	});

	translate.on('translateend', (e) => {
		const feature = e.features.getArray()[0];
		if (getDistanceFromDefault(feature) < tolerance) {
			feature.setGeometry(feature.get('default').clone().getGeometry());
		}
	});

	onMount(() => {
		map = new CanvasMap({
			target: 'map',
			interactions: defaultInteractions(),
			layers: [baseLayer, boundaryLayer],
			controls: [],
			view
		});

		stylefunction(baseLayer, styles, 'esri');

		boundarySource.getFeatures().forEach((feature) => {
			feature.set('default', feature.clone());
			if (Object.keys(positions).includes(feature.get('name'))) {
				feature.setGeometry(new Polygon(positions[feature.get('name')]));
			}
		});
	});

	onDestroy(() => {
		select.dispose();
		translate.dispose();
		map?.dispose();
	});
</script>

<div id="map" class:unblur={state > 0}></div>
<section class="info" class:centered={state === 0} class:collapsed={hide}>
	{#if state === 0}
		<div style="text-align: center; padding: 1rem;">
			<a href="https://detroitography.com">
				<picture>
					<source srcset="/logo-big.webp" type="image/webp" width="240px" height="120px" />
					<img src="/logo-big.png" alt="Detroitography logo" width="240px" height="120px" />
				</picture>
			</a>
			<h1><b>Regional Mapping Puzzle</b></h1>
			<p>
				Detroit is bordered by 20 municipalities, can you correctly place all of them? Michigan’s
				“Home Rule City” Act halted many smaller municipalities from being absorbed by the City of
				Detroit when it passed in 1909.
			</p>
			<p>
				Besides being a city, Detroit is also a broad concept in our metropolitan region. Residents
				of many adjacent cities affiliate with Detroit in order to be recognizable.
			</p>
			<Button
				on:click={() => {
					state = state + 1;
					map.addInteraction(select);
					map.addInteraction(translate);
				}}
			>
				Start
			</Button>
		</div>
	{:else if state === 1}
		<div>
			<p>Rearrange the county borders. To confirm your placements, press the button below.</p>
			<Button
				on:click={() => {
					view.animate({
						...submissionView,
						duration: 500
					});

					state = state + 1;
					map.removeInteraction(translate);
					map.removeInteraction(select);
				}}
			>
				Finish
			</Button>
		</div>
	{:else}
		{@const boundaries = boundarySource.getFeatures().filter((feature) => !isStatic(feature))}
		<div>
			<form style="display: flex; flex-direction: column; gap: 1rem;" method="POST">
				<CitySelect name="city_live" bind:value={city_live} label="1) Which city do you live in?" />
				<CitySelect name="city_work" bind:value={city_work} label="2) Which city do you work in?" />
				<CitySelect
					name="city_visit"
					bind:value={city_visit}
					label="3) What city do you most enjoy visiting?"
				/>
				<CitySelect
					name="city_avoid"
					bind:value={city_avoid}
					label="4) What city do you avoid visiting?"
				/>
				<Button
					disabled={!cities.includes(city_live) ||
						!cities.includes(city_work) ||
						!cities.includes(city_visit) ||
						!cities.includes(city_avoid)}
				>
					Submit Attempt
				</Button>
				<input
					type="hidden"
					name="features"
					value={JSON.stringify(
						boundaries.reduce(
							(dict, feature) => ({
								...dict,
								[feature.get('name')]: geojsonFormatter.writeFeatureObject(feature).geometry
							}),
							{}
						)
					)}
				/>
			</form>
		</div>
	{/if}
</section>
{#if state > 0}
	<button class="button window" on:click={() => (hide = !hide)}> ― </button>
{/if}
{#if state === 1}
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
			{@const features = boundarySource
				.getFeatures()
				.filter((feature) => feature.get('name').toLowerCase().includes(search.toLowerCase()))}
			<div class:search={!hideSearch}>
				<input class:textfield={!hideSearch} bind:this={searchRef} bind:value={search} />
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
{/if}

<style>
	@keyframes extend {
		from {
			width: 0;
		}
		to {
			width: 100%;
		}
	}

	@keyframes clear {
		from {
			filter: blur(6px);
		}
		to {
			filter: blur(0px);
		}
	}

	#map {
		filter: blur(6px);
		height: 100vh;
	}

	.unblur {
		animation: clear ease forwards 0.5s;
	}

	.info {
		position: absolute;
		top: 6.5%;
		left: 2%;

		max-width: 30rem;
		border-radius: 0.5rem;
		background: white;

		padding: 1rem;
	}

	.centered {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.collapsed {
		display: none;
	}

	h1 {
		font-size: 1.2rem;
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
</style>

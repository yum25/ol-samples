<script lang="ts">
	import CanvasMap from 'ol/Map.js';
	import View from 'ol/View.js';
	import VectorSource from 'ol/source/Vector';
	import VectorLayer from 'ol/layer/Vector';
	import { VectorTile } from 'ol/layer';
	import GeoJSON from 'ol/format/GeoJSON';

	import { getCenter } from 'ol/extent';
	import { Select, Translate, defaults as defaultInteractions } from 'ol/interaction.js';
	import { useGeographic } from 'ol/proj';
	import { Polygon } from 'ol/geom';
	import { stylefunction } from 'ol-mapbox-style';
	import type { Size } from 'ol/size';

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
	import CitySelect from '$lib/components/cityselect.svelte';
	import Button from '$lib/components/button.svelte';

	import boundaries from '$lib/references/boundaries.json';
	import coords from '$lib/references/coords.json';
	import styles from '$lib/styles.json';
	import cities from '$lib/references/cities.json';

	let map: CanvasMap;

	let exportPng: HTMLButtonElement;
	let downloadImg: HTMLAnchorElement;
	let searchRef: HTMLInputElement;

	let state = 0;
	let hide = false;
	let hideSearch = true;
	let search = '';

	let city_live = '';
	let city_work = '';
	let city_visit = '';
	let city_avoid = '';

	useGeographic();

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
		if (getDistanceFromDefault(feature) < 0.005) {
			feature.setGeometry(feature.get('default').clone().getGeometry());
		}
	});

	function onComplete() {
		boundaryLayer.setStyle((feature) => baseStyle(feature));

		if ($complete) {
			view.animate({ center: [-83.08403507579606, 42.382668117209296], zoom: 11.3, duration: 500 });

			setTimeout(() => {
				// From https://openlayers.org/en/latest/examples/export-map.html
				exportPng.addEventListener('click', function () {
					map.once('rendercomplete', function () {
						const mapCanvas = document.createElement('canvas');
						const size = <Size>map.getSize();
						mapCanvas.width = size[0];
						mapCanvas.height = size[1];
						const mapContext = <CanvasRenderingContext2D>mapCanvas.getContext('2d');
						Array.prototype.forEach.call(
							map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
							function (canvas) {
								if (canvas.width > 0) {
									const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
									mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
									let matrix;
									const transform = canvas.style.transform;
									if (transform) {
										// Get the transform parameters from the style's transform matrix
										matrix = transform
											.match(/^matrix\(([^\(]*)\)$/)[1]
											.split(',')
											.map(Number);
									} else {
										matrix = [
											parseFloat(canvas.style.width) / canvas.width,
											0,
											0,
											parseFloat(canvas.style.height) / canvas.height,
											0,
											0
										];
									}
									// Apply the transform to the export map context
									CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
									const backgroundColor = canvas.parentNode.style.backgroundColor;
									if (backgroundColor) {
										mapContext.fillStyle = backgroundColor;
										mapContext.fillRect(0, 0, canvas.width, canvas.height);
									}
									mapContext.drawImage(canvas, 0, 0);
								}
							}
						);
						mapContext.globalAlpha = 1;
						mapContext.setTransform(1, 0, 0, 1, 0, 0);
						downloadImg.href = mapCanvas.toDataURL();
						downloadImg.click();
					});
					map.renderSync();
				});
			}, 100);
		}
	}

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
			if (Object.keys(coords).includes(feature.get('name'))) {
				feature.setGeometry(new Polygon(coords[feature.get('name')]));
			}
		});
	});
</script>

<div id="map" class:unblur={state > 0}></div>
{#if $complete}
	{@const accuracy = getBordersAccuracy(
		boundarySource.getFeatures().filter((feature) => !isDetroit(feature))
	)}
	<section id="analysis" class:collapsed={hide}>
		<div style="display: flex;">
			<div style="width: {accuracy}%; background: lightgreen; padding: 0.5rem;">
				<b>{accuracy}%</b>
			</div>
			<div style="width: {100 - accuracy}%; background: lightcoral; padding: 0.5rem;"></div>
		</div>
		<p>
			You got {getBordersAccuracy(
				boundarySource.getFeatures().filter((feature) => !isDetroit(feature))
			)}% of the bordering counties positioned correctly!
		</p>
		<Button bind:ref={exportPng}>Download PNG</Button>
		<a id="image-download" download="map.png" bind:this={downloadImg} aria-hidden="true" />
	</section>
{/if}
<section class="info" class:centered={state === 0} class:collapsed={hide}>
	{#if $complete}
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
						boundarySource.getFeatures().reduce(
							(dict, feature) => ({
								...dict,
								[feature.get('name')]: feature.getGeometry().getCoordinates()
							}),
							{}
						)
					)}
				/>
			</form>
		</div>
	{:else if state === 0}
		<div style="text-align: center; padding: 1rem;">
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
			<button
				class="button command"
				on:click={() => {
					state = state + 1;
					map.addInteraction(select);
					map.addInteraction(translate);
				}}>Start</button
			>
		</div>
	{:else if state === 1}
		<div>
			<p>Rearrange the county borders. To confirm your placements, press the button below.</p>
			<Button
				on:click={() => {
					$complete = true;
					onComplete();
					state = state + 1;
					map.removeInteraction(translate);
					map.removeInteraction(select);
				}}
			>
				Finish
			</Button>
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

	#analysis {
		position: absolute;
		top: 6.5%;
		right: 2%;

		max-width: 30rem;
		border-radius: 0.5rem;
		background: white;

		padding: 1rem;
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
</style>

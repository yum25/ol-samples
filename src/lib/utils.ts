import { Polygon } from 'ol/geom';
import { getCenter } from 'ol/extent';
import type { FeatureLike } from 'ol/Feature';
import type { Geometry } from 'ol/geom';
import VectorTile from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { tolerance } from './constants';

export const baseSource = new VectorTile({
	attributions:
		'Sources: Esri, HERE, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors, and the GIS User Community',
	url: 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{y}/{x}.pbf',
	format: new MVT(),
	maxZoom: 17
});

export const getCountiesExtent = () => {
	const border = new Polygon([
		[[-83.7077264711691, 42.5449612971133]],
		[[-82.800343680423, 42.2003749373053]]
	]);

	border.scale(1.2);

	return border.getExtent();
};

export const isStatic = (feature: FeatureLike) =>
	feature.get('name') === 'Detroit' || feature.get('name') === 'Windsor';

export const getFeatureCenter = (feature: FeatureLike) => {
	return getCenter((feature.getGeometry() as Geometry).getExtent());
};

export const getDistanceFromDefault = (feature: FeatureLike) => {
	const newCenter = getFeatureCenter(feature);
	const oldCenter = getFeatureCenter(feature.get('default'));

	return Math.hypot(Math.abs(newCenter[0] - oldCenter[0]), Math.abs(newCenter[1] - oldCenter[1]));
};

export const borderCorrect = (feature: FeatureLike) => {
	return getDistanceFromDefault(feature) < tolerance;
};

export const getNumberCorrect = (features: FeatureLike[]) => {
	return features.reduce((correct, feature) => +borderCorrect(feature) + correct, 0);
};

export const getBordersAccuracy = (features: FeatureLike[]) => {
	return Math.round((getNumberCorrect(features) / features.length) * 100);
};

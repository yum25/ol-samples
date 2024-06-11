import { Style, Fill, Stroke, Text } from 'ol/style';
import type { FeatureLike } from 'ol/Feature';

import { getFeatureCenter } from './utils';

const coordinatesEqual = (a: number[], b: number[]) => a[0] === b[0] && a[1] === b[1];

const getStroke = (feature: FeatureLike, width: number, color: string) => {
	const currentCenter = getFeatureCenter(feature);
	const defaultCenter = getFeatureCenter(feature.get('default'));

	return new Stroke({
		color,
		width,
		lineDash: coordinatesEqual(currentCenter, defaultCenter) ? undefined : [10, 5]
	});
};

const text = (feature: FeatureLike, color: string) =>
	new Text({
		text: feature.get('name'),
		fill: new Fill({
			color
		}),
		stroke: new Stroke({
			color: 'white',
			width: 3
		}),
		font: '14px sans-serif',
		overflow: true
	});

export const baseStyle = (feature: FeatureLike) => {
	return new Style({
		text: text(feature, 'rgb(39, 39, 39)'),
		stroke: getStroke(feature, 2, 'rgb(39, 39, 39)'),
		fill: new Fill({
			color: 'transparent'
		})
	});
};

export const selectStyle = (feature: FeatureLike) => {
	return new Style({
		text: text(feature, '#3489eb'),
		stroke: getStroke(feature, 4, '#3489eb'),
		zIndex: 1,
		fill: new Fill({
			color: 'transparent'
		})
	});
};

import { Style, Fill, Stroke, Text } from 'ol/style';
import type { FeatureLike } from 'ol/Feature';

import { isDetroit } from './utils';

const fill: Record<string, string> = {
	Southfield: 'rgba(100, 143, 255, 0.3)',
	'Royal Oak Twp': 'rgba(120, 94, 240, 0.3)',
	'Oak Park': 'rgba(220, 38, 127, 0.3)',
	Ferndale: 'rgba(254, 97, 0, 0.3)',
	'Hazel Park': 'rgba(255, 176, 0, 0.3)',

	Warren: 'rgba(100, 143, 255, 0.3)',
	Eastpointe: 'rgba(120, 94, 240, 0.3)',
	'Harper Woods': 'rgba(220, 38, 127, 0.3)',
	'Grosse Pointe Woods': 'rgba(254, 97, 0, 0.3)',
	'Grosse Pointe Farms': 'rgba(255, 176, 0, 0.3)',

	'Grosse Pointe': 'rgba(100, 143, 255, 0.3)',
	'Grosse Pointe Park': 'rgba(120, 94, 240, 0.3)',
	'River Rouge': 'rgba(220, 38, 127, 0.3)',
	Ecorse: 'rgba(254, 97, 0, 0.3)',
	'Lincoln Park': 'rgba(255, 176, 0, 0.3)',

	Melvindale: 'rgba(100, 143, 255, 0.3)',
	Dearborn: 'rgba(120, 94, 240, 0.3)',
	'Dearborn Heights': 'rgba(220, 38, 127, 0.3)',
	'Redford Twp': 'rgba(254, 97, 0, 0.3)',
	'Highland Park': 'rgba(255, 176, 0, 0.3)',

	Hamtramck: 'rgba(100, 143, 255, 0.3)',
	Detroit: 'rgba(168, 208, 178, 0.3)'
};

const getStroke = (feature: FeatureLike, width: number, color: string) => {
	return new Stroke({
		color,
		width,
		lineDash:
			isDetroit(feature)
				? undefined
				: [10, 5]
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
		font: feature.get('name') !== 'Detroit' ? '14px sans-serif' : '16px sans-serif',
		overflow: !isDetroit(feature)
	});

export const baseStyle = (feature: FeatureLike) => {
	return new Style({
		text: text(feature, 'rgb(39, 39, 39)'),
		stroke: getStroke(feature, 2, 'rgb(39, 39, 39)'),
		fill: new Fill({
			color: fill[feature.get('name')] ?? 'transparent'
		})
	});
};

export const selectStyle = (feature: FeatureLike) => {
	return new Style({
		text: text(feature, '#3489eb'),
		stroke: getStroke(feature, 4, '#3489eb'),
		zIndex: 1,
		fill: new Fill({
			color: fill[feature.get('name')] ?? 'transparent'
		})
	});
};

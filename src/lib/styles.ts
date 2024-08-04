import { Style, Fill, Stroke, Text } from 'ol/style';
import type { FeatureLike } from 'ol/Feature';

import { borderCorrect, isStatic } from './utils';

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
	Detroit: 'rgba(168, 208, 178, 0.3)',
	Windsor: 'rgba(168, 208, 178, 0.3)'
};

const viewStroke = (feature: FeatureLike, width: number, color: string) => {
	return new Stroke({
		color,
		width,
		lineDash: isStatic(feature) || borderCorrect(feature) ? undefined : [10, 5]
	});
};

const viewFill = (feature: FeatureLike) => {
	return new Fill({
		color:
			isStatic(feature) || borderCorrect(feature)
				? fill[feature.get('name')]
				: 'rgba(200, 200, 200, 0.3)'
	});
};

const baseStroke = (feature: FeatureLike, width: number, color: string) => {
	return new Stroke({
		color,
		width,
		lineDash: isStatic(feature) ? undefined : [10, 5]
	});
};

const baseFill = (feature: FeatureLike) => {
	return new Fill({
		color: isStatic(feature) ? fill[feature.get('name')] : 'rgba(200, 200, 200, 0.3)'
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
		overflow: !isStatic(feature)
	});

export const viewStyle = (feature: FeatureLike) => {
	return new Style({
		text: text(feature, 'rgb(39, 39, 39)'),
		stroke: viewStroke(feature, 2, 'rgb(39, 39, 39)'),
		fill: viewFill(feature)
	});
};

export const selectStyle = (feature: FeatureLike) => {
	return new Style({
		text: text(feature, '#3489eb'),
		stroke: baseStroke(feature, 4, '#3489eb'),
		zIndex: 1,
		fill: baseFill(feature)
	});
};

export const baseStyle = (feature: FeatureLike) => {
	return new Style({
		text: text(feature, 'rgb(39, 39, 39)'),
		stroke: baseStroke(feature, 2, 'rgb(39, 39, 39)'),
		fill: baseFill(feature)
	});
};

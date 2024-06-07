import { Style, Fill, Stroke, Text } from "ol/style";
import type { FeatureLike } from "ol/Feature";

import { getFeatureCenter } from "./utils";

const coordinatesEqual = (a:number[], b:number[]) => a[0] === b[0] && a[1] === b[1]

const getStroke = (feature: FeatureLike, defaultFeature: FeatureLike, width: number, color: string) => {
    const currentCenter = getFeatureCenter(feature);
    const defaultCenter = getFeatureCenter(defaultFeature);

    return new Stroke({
        color,
        width,
        lineDash: coordinatesEqual(currentCenter, defaultCenter) ? undefined : [10, 5]
    });
};

export const baseStyle = (feature: FeatureLike, defaultFeature: FeatureLike) => {
    return new Style({
        text: new Text({ text: feature.get('name'), font: '14px sans-serif' }),
        stroke: getStroke(
            feature,
            defaultFeature,
            3, 'gray'),
        fill: new Fill({
            color: "transparent"
        })
    });
}

export const selectStyle = (feature: FeatureLike, defaultFeature: FeatureLike) => {
    return new Style({
        text: new Text({ text: feature.get('name'), font: '14px sans-serif', overflow: true }),
        stroke: getStroke(
            feature,
            defaultFeature,
            5,
            '#3489eb',
        ),
        zIndex: 1,
        fill: new Fill({
            color: "transparent"
        })
    });
}
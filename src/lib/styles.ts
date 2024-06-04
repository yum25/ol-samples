import { Style, Fill, Stroke, Text } from "ol/style";
import type { FeatureLike } from "ol/Feature";

import { getFeatureCenter } from "./utils";

const getFill = (feature: FeatureLike, defaultFeature: FeatureLike) => {
    const currentCenter = getFeatureCenter(feature);
    const defaultCenter = getFeatureCenter(defaultFeature);

    return new Fill({
        color:
            currentCenter[0] === defaultCenter[0] && currentCenter[1] === defaultCenter[1]
                ? 'rgb(119, 174, 116)'
                : 'white'
    });
};

export const baseStyle = (feature: FeatureLike, defaultFeature: FeatureLike) => {
    return new Style({
        text: new Text({ text: feature.get('name'), font: '12px sans-serif' }),
        stroke: new Stroke({
            color: 'black',
            width: 1
        }),
        fill: getFill(feature, defaultFeature)
    });
}

export const selectStyle = (feature: FeatureLike, defaultFeature: FeatureLike) => {
    return new Style({
        text: new Text({ text: feature.get('name'), font: '12px sans-serif', overflow: true }),
        stroke: new Stroke({
            color: 'blue',
            width: 4
        }),
        zIndex: 1,
        fill: getFill(feature, defaultFeature)
    });
}
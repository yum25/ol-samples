import { Fill } from "ol/style";
import type { FeatureLike } from "ol/Feature";

import { getFeatureCenter } from "./utils";

export const getFill = (feature: FeatureLike, defaultFeature: FeatureLike) => {
    const currentCenter = getFeatureCenter(feature);
    const defaultCenter = getFeatureCenter(defaultFeature);

    return new Fill({
        color:
            currentCenter[0] === defaultCenter[0] && currentCenter[1] === defaultCenter[1]
                ? 'rgb(119, 174, 116)'
                : 'white'
    });
};
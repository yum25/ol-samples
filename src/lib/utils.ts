import { Polygon } from "ol/geom";
import { getCenter } from "ol/extent";
import type { FeatureLike } from "ol/Feature";
import type {Geometry} from "ol/geom";

export const getCountiesExtent = () => {
    const border = new Polygon([
        [[-83.7877264711691, 42.6549612971133]],
        [[-82.510343680423, 42.0503749373053]]
    ]);

    border.scale(1.2);

    return border.getExtent();
};

export const getFeatureCenter = (feature: FeatureLike) => {
    return getCenter((feature.getGeometry() as Geometry).getExtent());
};

export const getDistanceFromDefault = (feature: FeatureLike, defaultFeature: FeatureLike) => {
    const newCenter = getFeatureCenter(feature);
    const oldCenter = getFeatureCenter(defaultFeature);

    return Math.hypot(Math.abs(newCenter[0] - oldCenter[0]), Math.abs(newCenter[1] - oldCenter[1]));
};
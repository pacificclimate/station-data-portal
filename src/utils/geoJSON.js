import flattenDepth from "lodash/fp/flattenDepth";
import map from "lodash/fp/map";
import min from "lodash/fp/min";
import max from "lodash/fp/max";
import { isPointInPolygonWn } from "./geometry-algorithms";

// GeoJSON MultiPolygon format. Taken from
// https://conservancy.umn.edu/bitstream/handle/11299/210208/GeoJSON_Primer_2019.pdf
//
// {
//   "type": "MultiPolygon",
//   "coordinates": [
//     // one or more Polygon coordinate array:
//     [
//       // one or more Linear ring coordinate arrays:
//       [
//          // at least four Points; first point = last point:
//         [x0, y0],
//         [x1, y1],
//         [x2, y2],
//         // ...
//         [x0, y0]
//       ],
//       // ...
//     ],
//     // ...
//   ],
//   // ...
// };

export const checkGeoJSONMultiPolygon = (geometry) => {
  if (geometry["type"] !== "MultiPolygon") {
    throw new Error(`Invalid geometry type: ${geometry["type"]}`);
  }
};

export const gJMultiPolygonBoundingBox = (geometry) => {
  const points = flattenDepth(3, geometry["coordinates"]);
  const xs = map((p) => p[0], points);
  const ys = map((p) => p[1], points);
  return [
    [min(xs), max(ys)], // top left
    [max(xs), min(ys)], // bottom right
  ];
};

const getX = (point) => point[0];
const getY = (point) => point[1];
export const isPointInGeoJSONPolygon = isPointInPolygonWn(getX, getY);

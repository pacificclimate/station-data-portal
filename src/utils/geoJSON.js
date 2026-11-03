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

// ST_Intersects includes polygon boundaries, including hole boundaries.
export const isPointOnGeoJSONRing = (ring, point) =>
  ring.some((start, i) => {
    const end = ring[(i + 1) % ring.length];
    const [x, y] = point;
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const cross = dx * (y - start[1]) - dy * (x - start[0]);
    const tolerance =
      Number.EPSILON * 32 * Math.max(1, Math.abs(dx), Math.abs(dy)) ** 2;
    return (
      Math.abs(cross) <= tolerance &&
      x >= Math.min(start[0], end[0]) &&
      x <= Math.max(start[0], end[0]) &&
      y >= Math.min(start[1], end[1]) &&
      y <= Math.max(start[1], end[1])
    );
  });

export const isPointInGeoJSONArea = (rings, point) =>
  rings.some((ring) => isPointOnGeoJSONRing(ring, point)) ||
  (Boolean(isPointInGeoJSONPolygon(rings[0], point)) &&
    !rings.slice(1).some((ring) => isPointInGeoJSONPolygon(ring, point)));

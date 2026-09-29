// Draws polylines and polygons with edges straight in lon/lat, as PostGIS and
// the station filter treat a selection's edges, instead of straight on screen.
// On the BC map's Albers projection a lon/lat-straight edge is a curve: a
// parallel sags south of the straight line between its ends.
//
// Opt-in per layer with the `lonLatEdges: true` path option. Only the drawing
// changes: the layer's latlngs, its GeoJSON and the WKT sent to the backend
// stay the user's vertices.
//
// Leaflet has no option for this, so this wraps its internal
// `Polyline._projectLatlngs`, where every path is projected to screen points
// once per zoom or change. Splitting each edge there curves the painted path,
// its bounds and its click area together. StationMap.drawing.test.jsx checks
// that the drawn edge follows the curve, which catches a Leaflet upgrade that
// bypasses this.
import L from "leaflet";

// Split an edge until its projected midpoint is within this of the straight
// line on screen. Below Leaflet's 1 px `smoothFactor`, which simplifies the
// points again afterwards.
const TOLERANCE_PX = 0.5;
const MAX_DEPTH = 12;

const midpoint = (a, b) => L.latLng((a.lat + b.lat) / 2, (a.lng + b.lng) / 2);
// A layer point, unrounded (`latLngToLayerPoint` rounds to whole pixels).
const layerPoint = (map, latlng) =>
  map.project(latlng).subtract(map.getPixelOrigin());

// Push the points strictly between a and b onto `out`.
const splitEdge = (map, a, pa, b, pb, out, depth) => {
  if (depth >= MAX_DEPTH) return;
  const m = midpoint(a, b);
  const pm = layerPoint(map, m);
  if (L.LineUtil.pointToSegmentDistance(pm, pa, pb) <= TOLERANCE_PX) return;
  splitEdge(map, a, pa, m, pm, out, depth + 1);
  out.push(pm);
  splitEdge(map, m, pm, b, pb, out, depth + 1);
};

const projectLatlngs = L.Polyline.prototype._projectLatlngs;

L.Polyline.include({
  _projectLatlngs(latlngs, result, bounds) {
    // Nested rings recurse back in here one flat ring at a time.
    if (!this.options.lonLatEdges || !(latlngs[0] instanceof L.LatLng)) {
      return projectLatlngs.call(this, latlngs, result, bounds);
    }
    const closed = this instanceof L.Polygon;
    const points = latlngs.map((latlng) => layerPoint(this._map, latlng));
    const ring = [];
    latlngs.forEach((a, i) => {
      ring.push(points[i]);
      const j = (i + 1) % latlngs.length;
      if (j > 0 || (closed && latlngs.length > 2)) {
        splitEdge(this._map, a, points[i], latlngs[j], points[j], ring, 0);
      }
    });
    ring.forEach((point) => bounds.extend(point));
    result.push(ring);
  },
});

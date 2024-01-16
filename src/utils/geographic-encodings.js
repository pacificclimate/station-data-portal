// Convert a GeoJSON object into a WKT string.
// Adapted from (ahem) somewhat problematic Climate Explorer code.
// Caveat emptor.
export const geoJSON2WKT = (gj) => {
  if (!(gj && gj.type)) {
    return "";
  }

  function pairWKT(c) {
    return c.join(" ");
  }

  function ringWKT(r) {
    return r.map(pairWKT).join(", ");
  }

  function ringsWKT(r) {
    return r.map(ringWKT).map(wrapParens).join(", ");
  }

  function multiRingsWKT(r) {
    return r.map(ringsWKT).map(wrapParens).join(", ");
  }

  function wrapParens(s) {
    return "(" + s + ")";
  }

  switch (gj.type) {
    case "Feature":
      return geoJSON2WKT(gj.geometry);
    case "Point":
      return "POINT (" + pairWKT(gj.coordinates) + ")";
    case "LineString":
      return "LINESTRING (" + ringWKT(gj.coordinates) + ")";
    case "Polygon":
      return "POLYGON (" + ringsWKT(gj.coordinates) + ")";
    case "MultiPoint":
      return "MULTIPOINT (" + ringWKT(gj.coordinates) + ")";
    case "MultiPolygon":
      return "MULTIPOLYGON (" + multiRingsWKT(gj.coordinates) + ")";
    case "MultiLineString":
      return "MULTILINESTRING (" + ringsWKT(gj.coordinates) + ")";
    case "GeometryCollection":
      return (
        "GEOMETRYCOLLECTION (" + gj.geometries.map(geoJSON2WKT).join(", ") + ")"
      );
    default:
      throw new Error(
        "geoJSON2WKT requires a valid GeoJSON Feature or geometry object as input",
      );
  }
};

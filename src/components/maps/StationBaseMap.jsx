import React, { useMemo } from "react";
import L from "leaflet";
import "proj4leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import { projCRSOptions } from "pcic-react-leaflet-components";

// The shared basemap does not expose TileLayer's native zoom limit. Reuse its
// tileset/projection definitions while extending the CRS and scaling native
// tiles at closer zooms, without requesting levels the tile server lacks.
export default function StationBaseMap({
  baseMap,
  baseMapTilesUrl,
  maxZoom = 18,
  children,
  ...mapOptions
}) {
  const { projection, tileMatrix, attribution } = baseMap.tileset;
  const maxNativeZoom = tileMatrix.numResolutions - 1;
  const crs = useMemo(
    () =>
      new L.Proj.CRS(projection.code, projection.proj4def, {
        ...projCRSOptions({
          ...tileMatrix,
          numResolutions: Math.max(tileMatrix.numResolutions, maxZoom + 1),
        }),
        ...projection.options,
      }),
    [projection, tileMatrix, maxZoom],
  );
  return (
    <MapContainer crs={crs} maxZoom={maxZoom} {...mapOptions}>
      <TileLayer
        url={baseMapTilesUrl}
        attribution={attribution}
        noWrap
        maxNativeZoom={maxNativeZoom}
        maxZoom={maxZoom}
      />
      {children}
    </MapContainer>
  );
}

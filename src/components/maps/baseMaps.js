import { BCBaseMap, YNWTBaseMap } from "pcic-react-leaflet-components";

export default {
  BC: {
    BaseMap: BCBaseMap,
    initialViewport: BCBaseMap.initialViewport,
    minZoom: 6,
    baseMapTilesUrl: window.env.REACT_APP_BC_BASE_MAP_TILES_URL,
    eezGeoJSONUrl: window.env.REACT_APP_EEZ_GEOJSON_URL,
  },
  YNWT: {
    BaseMap: YNWTBaseMap,
    initialViewport: YNWTBaseMap.initialViewport,
    minZoom: 5,
    baseMapTilesUrl: window.env.REACT_APP_YNWT_BASE_MAP_TILES_URL,
    eezGeoJSONUrl: window.env.REACT_APP_EEZ_GEOJSON_URL,
  },
};

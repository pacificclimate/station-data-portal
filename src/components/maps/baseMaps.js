import { BCBaseMap, YNWTBaseMap } from "pcic-react-leaflet-components";

export default {
  BC: {
    BaseMap: BCBaseMap,
    initialViewport: BCBaseMap.initialViewport,
    baseMapTilesUrl: window.env.REACT_APP_BC_BASE_MAP_TILES_URL,
  },
  YNWT: {
    BaseMap: YNWTBaseMap,
    initialViewport: YNWTBaseMap.initialViewport,
    baseMapTilesUrl: window.env.REACT_APP_YNWT_BASE_MAP_TILES_URL,
  },
};

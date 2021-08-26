import { BCBaseMap, YNWTBaseMap } from 'pcic-react-leaflet-components';

export default {
  BC: { 
    BaseMap: BCBaseMap,  
    initialViewport: BCBaseMap.initialViewport,
  },
  YNWT: { 
    BaseMap: YNWTBaseMap,  
    initialViewport: YNWTBaseMap.initialViewport,
  },
};

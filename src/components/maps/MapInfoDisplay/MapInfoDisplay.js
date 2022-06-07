import React, { useState } from 'react';
import { StaticControl } from "pcic-react-leaflet-components";

import './MapInfoDisplay.css';
import { useMapEvents } from 'react-leaflet';

const info = map => `Zoom: ${map.getZoom()}`;

function MapInfoDisplay(scProps) {
  const map = useMapEvents({
    zoom: () => setValue(info(map)),
  });
  const [value, setValue] = useState(info(map));
  return (
    <StaticControl {...scProps}>{value}</StaticControl>
  );
}

export default MapInfoDisplay;

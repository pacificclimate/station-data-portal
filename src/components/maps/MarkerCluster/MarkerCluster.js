import React, { useEffect } from 'react';
import { LeafletProvider, useLeafletContext, } from '@react-leaflet/core'
import L from 'leaflet';

import logger from '../../../logger';

import './MarkerCluster.css';

require('leaflet.markercluster');
logger.configure({ active: true });

function MarkerCluster(props) {
  const context = useLeafletContext();
  // Leaflet.markerClusterGroup does not provide an update function for most
  // options (the props here). So we can't use the standard React Leaflet core
  // hooks and factories to implement this. Instead, we must create a new
  // instance of markerClusterGroup each time the props change, and add it to
  // the container. The previous instance gets removed when useEffect cleans up
  // before the next render.
  const instance = new L.markerClusterGroup(props);

  useEffect(() => {
    const container = context.layerContainer ?? context.map
    container.addLayer(instance)

    return function removeLayer() {
      container.removeLayer(instance)
    }
  });

  if (props.children == null) {
    return null;
  }
  // Return the children (markers) inside a LeafletProvider with the new
  // context including the new instance. Not sure why *returning* this is
  // necessary, but LeafletProvider with new context makes total sense.
  return (
    <LeafletProvider value={{ ...context, layerContainer: instance }}>
      {props.children}
    </LeafletProvider>
  )
}

MarkerCluster.propTypes = {
};

export default MarkerCluster;

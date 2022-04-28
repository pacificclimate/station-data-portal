import PropTypes from 'prop-types';
import {
  createElementHook,
  createLayerHook,
  createContainerComponent,
} from '@react-leaflet/core'
import L from 'leaflet';

import logger from '../../../logger';

import './MarkerCluster.css';

require('leaflet.markercluster');  // TODO: Necessary?
logger.configure({ active: true });

function createMarkerClusterGroup(props, context) {
  const instance = new L.markerClusterGroup(props);
  return {
    instance,
    context: { ...context, layerContainer: instance },
  }
}

// This works, but it doesn't respond to changes in props.
const useMarkerClusterGroupElement = createElementHook(createMarkerClusterGroup);
const useMarkerClusterGroup = createLayerHook(useMarkerClusterGroupElement);
const MarkerCluster = createContainerComponent(useMarkerClusterGroup);


MarkerCluster.propTypes = {
};

export default MarkerCluster;
